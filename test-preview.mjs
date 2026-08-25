import assert from 'node:assert/strict';
import { once } from 'node:events';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { basename, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const port = 42000 + (process.pid % 1000);
const siblingName = `${basename(root)}-preview-smoke-${process.pid}.txt`;
const siblingPath = resolve(root, '..', siblingName);

function get(pathname) {
  return new Promise((resolveRequest, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path: pathname }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolveRequest({ body, headers: response.headers, status: response.statusCode }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function startServer() {
  const server = spawn(process.execPath, ['preview.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let startupError = '';
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', (chunk) => { startupError += chunk; });
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(() => Promise.reject(new Error(startupError || 'Preview server stopped during startup.')))
  ]);
  return server;
}

test('preview serves public files and blocks traversal attempts', async () => {
  writeFileSync(siblingPath, 'outside-preview-marker', 'utf8');
  const server = await startServer();

  try {
    for (const pathname of ['/', '/produto-alimentador.html', '/robots.txt', '/styles.css', '/script.js', '/image/cropped-favicon.webp']) {
      assert.equal((await get(pathname)).status, 200, pathname);
    }

    for (const pathname of ['/styles.css', '/script.js', '/image/cropped-favicon.webp']) {
      const response = await get(pathname);
      assert.equal(response.headers['cache-control'], 'public, max-age=3600', pathname);
    }

    for (const pathname of ['/', '/produto-alimentador.html']) {
      const response = await get(pathname);
      assert.equal(response.headers['cache-control'], 'public, max-age=0, must-revalidate', pathname);
    }

    for (const pathname of ['/missing-page', '/produto/inexistente']) {
      const response = await get(pathname);
      assert.equal(response.status, 404, pathname);
      assert.match(response.body, /Esta página não está disponível/);
      assert.match(response.body, /href="\/styles\.css"/);
      assert.match(response.body, /src="\/script\.js"/);
      assert.match(response.body, /href="\/"/);
    }

    for (const pathname of [
      `/../${siblingName}`,
      `/..%5c${siblingName}`,
      `/%2e%2e%5c${siblingName}`,
      `/%252e%252e%255c${siblingName}`
    ]) {
      const response = await get(pathname);
      assert.equal(response.status, 404, pathname);
      assert.doesNotMatch(response.body, /outside-preview-marker/);
    }
  } finally {
    server.kill();
    await once(server, 'exit');
    if (existsSync(siblingPath)) rmSync(siblingPath);
  }
});
