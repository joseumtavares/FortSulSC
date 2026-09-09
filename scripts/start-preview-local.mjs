#!/usr/bin/env node
// Sobe o build de produção localmente usando as variáveis reais do ambiente
// Vercel (Preview por padrão), com um punhado de sobreposições só para o
// processo local (origem/URL apontando para localhost, cookies sem HTTPS).
// Substitui start-preview-local.ps1 (Windows-only) por uma versão que roda
// igual em Linux, macOS e Windows.
//
// As sobreposições são aplicadas no ambiente deste processo ANTES de chamar
// `vercel env run`, que herda esse ambiente ao injetar as variáveis reais do
// Preview — abordagem validada na Fatia 4.6, mais simples que reinvocar um
// processo filho só para aplicar as sobreposições depois.

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function fail(message) {
  console.error(`Erro: ${message}`)
  process.exit(1)
}

const args = process.argv.slice(2)
const environmentFlagIndex = args.indexOf('--env')
const vercelEnvironment = environmentFlagIndex !== -1 ? args[environmentFlagIndex + 1] : 'preview'
if (!['preview', 'development', 'production'].includes(vercelEnvironment)) {
  fail(`Ambiente Vercel inválido: '${vercelEnvironment}'. Use preview, development ou production.`)
}

if (!existsSync(path.join(projectRoot, 'node_modules'))) {
  fail('Dependências ausentes. Execute: node scripts/bootstrap-preview-worktree.mjs nesta worktree primeiro.')
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore', shell: true })
  return !result.error && result.status === 0
}

if (!commandExists('vercel')) {
  fail('Vercel CLI não foi encontrada. Execute o bootstrap após instalar e autenticar a CLI.')
}

// As sobreposições existem somente no processo local: Preview permanece HTTPS.
const childEnv = {
  ...process.env,
  AUTH_ORIGIN: 'http://localhost:3000',
  AUTH_URL: 'http://localhost:3000',
  AUTH_COOKIE_SECURE: 'false',
  SECURITY_HEADERS_HSTS: 'false',
}

function invokeVercelNpm(npmScript) {
  const result = spawnSync('vercel', ['env', 'run', '-e', vercelEnvironment, '--', 'npm', 'run', npmScript], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
    env: childEnv,
  })
  if (result.status !== 0) {
    fail(`Falha no "npm run ${npmScript}" usando o ambiente Vercel ${vercelEnvironment}.`)
  }
}

invokeVercelNpm('build')
invokeVercelNpm('start')
