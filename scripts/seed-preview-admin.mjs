#!/usr/bin/env node
// Prepara o administrador de teste no ambiente Preview/Supabase deste
// projeto. A senha fica só na memória do processo filho durante o seed;
// nunca é escrita no .env nem impressa no terminal.
// Substitui seed-preview-admin.ps1 (Windows-only) por uma versão que roda
// igual em Linux, macOS e Windows.

import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.slice(2).includes('--check-only')

function fail(message) {
  console.error(`Erro: ${message}`)
  process.exit(1)
}

if (!existsSync(path.join(projectRoot, 'node_modules'))) {
  fail('Dependência local ausente. Execute npm ci antes de repetir o seed.')
}

// Confere o destino antes de criar dados. Não imprime a URL nem a senha.
function assertExpectedDestination() {
  const envPath = path.join(projectRoot, '.env')
  if (!existsSync(envPath)) {
    fail('Arquivo .env não encontrado na raiz da worktree.')
  }
  const parsed = dotenv.parse(readFileSync(envPath, 'utf8'))
  const databaseUrl = process.env.DATABASE_URL ?? parsed.DATABASE_URL
  const databasePlatform = parsed.DATABASE_PLATFORM

  try {
    const url = new URL(databaseUrl)
    const isExpectedSupabase =
      databasePlatform === 'supabase' &&
      url.hostname.endsWith('.pooler.supabase.com') &&
      url.username === 'postgres.qhttphrfozrwgurnlmni'

    if (!isExpectedSupabase) throw new Error('destino inesperado')
    console.log('Destino conferido: Supabase de teste deste projeto.')
  } catch {
    fail('Destino inesperado. Confira DATABASE_PLATFORM e DATABASE_URL antes do seed.')
  }
}

assertExpectedDestination()

// Verifica a mesma resolução de comando usada pelo processo filho do Prisma.
function checkChildProcessCanRunTsx() {
  const result = spawnSync('npx', ['--no-install', 'tsx', '--version'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  })
  if (result.status !== 0) {
    fail('O processo filho não conseguiu executar tsx. Rode npm ci e tente novamente.')
  }
}

if (checkOnly) {
  checkChildProcessCanRunTsx()
  console.log('Dependências verificadas. Nenhum dado foi criado.')
  process.exit(0)
}

function ask(promptText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(promptText, (answer) => {
    rl.close()
    resolve(answer)
  }))
}

function askHidden(promptText) {
  if (!process.stdin.isTTY) {
    console.warn('Terminal não interativo: a senha será digitada visivelmente.')
    return ask(promptText)
  }

  return new Promise((resolve) => {
    process.stdout.write(promptText)
    let input = ''
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    const onData = (char) => {
      if (char === '\n' || char === '\r' || char === '') {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(input)
      } else if (char === '') {
        process.stdout.write('\n')
        process.exit(1)
      } else if (char === '' || char === '\b') {
        input = input.slice(0, -1)
      } else {
        input += char
      }
    }

    process.stdin.on('data', onData)
  })
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const email = (await ask('E-mail do administrador: ')).trim().toLowerCase()
if (!emailPattern.test(email)) {
  fail('Digite um endereço de e-mail completo.')
}

const password = await askHidden('Senha para entrar no site (digitação oculta): ')
if (password.length === 0) {
  fail('A senha não pode ficar vazia.')
}

const childEnv = {
  ...process.env,
  ADMIN_SEED_EMAIL: email,
  ADMIN_SEED_PASSWORD: password,
  ADMIN_SEED_RESET_PASSWORD: 'false',
  SEED_ADMIN_REQUIRED: 'true',
}

// Usa o seed direto via tsx: cria as seis categorias e o administrador.
// Se a conta já existir, este comando preserva a senha cadastrada.
// `prisma db seed` não é usado aqui porque, neste stack, pode retornar
// sucesso sem executar `prisma/seed.ts` de fato — ver docs/WORKTREE_PREVIEW.md.
const result = spawnSync('npx', ['--no-install', 'tsx', 'prisma/seed.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
  env: childEnv,
})

if (result.status !== 0) {
  fail('O seed falhou. Confira a mensagem anterior.')
}

console.log('Seed concluído. Agora teste http://localhost:3000/admin/login')
