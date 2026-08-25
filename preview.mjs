import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const root = realpathSync(process.cwd());
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png'
};

function cacheControlFor(pathname) {
  const ext = extname(pathname).toLowerCase();
  if (['.css', '.js', '.webp', '.png', '.jpg', '.jpeg', '.ico'].includes(ext)) {
    return 'public, max-age=3600';
  }
  if (['.html'].includes(ext) || pathname === '/' || pathname === '/index.html') {
    return 'public, max-age=0, must-revalidate';
  }
  return 'public, max-age=3600';
}

function sendNotFound(response) {
  const notFoundPath = join(root, '404.html');
  if (existsSync(notFoundPath) && statSync(notFoundPath).isFile()) {
    response.writeHead(404, { 'Content-Type': types['.html'] });
    createReadStream(notFoundPath).pipe(response);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Arquivo não encontrado');
}

function decodePathname(requestUrl) {
  let pathname = (requestUrl || '/').split('?', 1)[0];

  try {
    for (let index = 0; index < 3; index += 1) {
      const decoded = decodeURIComponent(pathname);
      if (decoded === pathname) break;
      pathname = decoded;
    }
  } catch {
    return null;
  }

  return pathname;
}

function isInsideRoot(filePath) {
  const relativePath = relative(root, filePath);
  return relativePath !== '' && !relativePath.startsWith(`..${sep}`) && relativePath !== '..' && !isAbsolute(relativePath);
}

createServer((request, response) => {
  const pathname = decodePathname(request.url);
  if (pathname === null || pathname.includes('\0')) {
    sendNotFound(response);
    return;
  }

  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^[\\/]+/, '');
  const hasTraversalSegment = requestedPath.split(/[\\/]+/).includes('..');
  const filePath = resolve(root, requestedPath);

  if (!requestedPath || isAbsolute(requestedPath) || hasTraversalSegment || !isInsideRoot(filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    sendNotFound(response);
    return;
  }

  let resolvedFilePath;
  try {
    resolvedFilePath = realpathSync(filePath);
  } catch {
    sendNotFound(response);
    return;
  }
  if (!isInsideRoot(resolvedFilePath)) {
    sendNotFound(response);
    return;
  }

  response.writeHead(200, {
    'Cache-Control': cacheControlFor(resolvedFilePath),
    'Content-Type': types[extname(resolvedFilePath).toLowerCase()] || 'application/octet-stream'
  });
  createReadStream(resolvedFilePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`FortSul frontend: http://127.0.0.1:${port}`);
});
