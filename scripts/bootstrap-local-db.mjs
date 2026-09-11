#!/usr/bin/env node
// Prepara o banco Postgres local isolado desta worktree: sobe só o serviço
// `db` via Docker Compose, espera ficar pronto e roda migrate/seed/test:db
// dentro da rede do Compose (nunca a partir do host). Substitui
// bootstrap-local-db.ps1 (Windows-only) por uma versão que roda igual em
// Linux, macOS e Windows.
//
// Replica fielmente a lógica do .ps1: nome de projeto Compose derivado da
// worktree atual (para não reutilizar volume/seed de outra branch), .env
// carregado apenas no processo (nunca exibido ou versionado), validação das
// variáveis obrigatórias e migrate/seed/test:db executados com a role
// proprietária (POSTGRES_USER), não a role restrita fortsul_app usada em
// runtime.

import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const skipMigration = args.includes('--SkipMigration')
const skipSeed = args.includes('--SkipSeed')
const runDbTests = args.includes('--RunDbTests')

function fail(message) {
  console.error(`Erro: ${message}`)
  process.exit(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return
  }

  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r\n|\r|\n/)) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 1) {
      continue
    }

    const name = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1)
    process.env[name] = value
  }
}

function getComposeProjectName(projectDir) {
  let leaf = path.basename(projectDir)
  if (leaf === '.worktrees') {
    leaf = path.basename(path.dirname(projectDir))
  }

  let normalized = leaf.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  normalized = normalized.replace(/^-+|-+$/g, '')
  if (normalized === '') {
    normalized = 'worktree'
  }

  return `fortsulsc-${normalized}`
}

// Equivalente a [Uri]::EscapeDataString: escapa tudo fora do conjunto
// "unreserved" de RFC 3986 (A-Z a-z 0-9 - _ . ~), diferente de
// encodeURIComponent, que deixa ! * ' ( ) sem escapar.
function encodeUriComponentStrict(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

// Sem shell:true: `docker` é um executável real em todas as plataformas (não
// um script .cmd como npm/npx no Windows), e os argumentos aqui incluem a
// DATABASE_URL com usuário/senha — passá-los por um shell concatenaria a
// string sem escapar, um risco real de injeção.
function commandExists(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' })
  return !result.error && result.status === 0
}

function runChecked(command, commandArgs, errorMessage) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', cwd: projectDirectory })
  if (result.status !== 0) {
    fail(errorMessage ?? `Falha ao executar: ${command} ${commandArgs.join(' ')}`)
  }
}

async function waitForDatabase(composeProjectName, databaseUser, databaseName, databasePassword) {
  const tries = 30
  for (let attempt = 1; attempt <= tries; attempt++) {
    const result = spawnSync(
      'docker',
      [
        'compose',
        '-p',
        composeProjectName,
        'exec',
        '-T',
        'db',
        'env',
        `PGPASSWORD=${databasePassword}`,
        'pg_isready',
        '-U',
        databaseUser,
        '-d',
        databaseName,
      ],
      { stdio: 'ignore', cwd: projectDirectory },
    )
    if (result.status === 0) {
      return
    }

    await sleep(2000)
  }

  fail('O Postgres local não ficou pronto a tempo.')
}

// A migration fatia_4_3 cria a role restrita `fortsul_app` sem senha de
// propósito (nenhum segredo em SQL versionado); sem este passo, todo volume
// novo nasce com a role sem senha e a aplicação falha a autenticação em toda
// query. Idempotente: ALTER ROLE ... WITH PASSWORD é seguro de repetir.
// A senha nunca é passada por argv nem aparece em log — vai só pelo stdin do
// `prisma db execute`, dentro do SQL, usando a role proprietária (via
// DATABASE_URL/migrateUrl) para executar o ALTER ROLE.
function setAppRolePassword(composeProjectName, migrateUrl, appUser, appPassword) {
  const escapedUser = appUser.replace(/"/g, '""')
  const escapedPassword = appPassword.replace(/'/g, "''")
  const sql = `ALTER ROLE "${escapedUser}" WITH PASSWORD '${escapedPassword}';`

  const result = spawnSync(
    'docker',
    [
      'compose',
      '-p',
      composeProjectName,
      'run',
      '--rm',
      '--no-deps',
      '-e',
      `DATABASE_URL=${migrateUrl}`,
      'app',
      'npx',
      'prisma',
      'db',
      'execute',
      '--schema=prisma/schema.prisma',
      '--stdin',
    ],
    { stdio: ['pipe', 'inherit', 'inherit'], cwd: projectDirectory, input: sql },
  )
  if (result.status !== 0) {
    fail('Falha ao definir a senha da role fortsul_app (ALTER ROLE).')
  }
}

async function main() {
  const composeProjectName = getComposeProjectName(projectDirectory)

  const parentDirectory = path.dirname(projectDirectory)
  const repoRoot = path.basename(parentDirectory) === '.worktrees' ? path.dirname(parentDirectory) : projectDirectory

  const localEnvPath = path.join(projectDirectory, '.env')
  const fallbackEnvPath = path.join(repoRoot, '.env')
  if (existsSync(localEnvPath)) {
    loadDotEnv(localEnvPath)
  } else {
    loadDotEnv(fallbackEnvPath)
  }

  if (!commandExists('docker')) {
    fail('docker não foi encontrado. Abra uma sessão com Docker Desktop acessível antes de continuar.')
  }

  const dockerInfo = spawnSync('docker', ['info'], { stdio: 'ignore' })
  if (dockerInfo.status !== 0) {
    fail(
      'Docker CLI encontrada, mas o Docker Desktop/engine Linux não está disponível. Inicie o Docker Desktop e aguarde o status Running antes de continuar.',
    )
  }

  for (const name of ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'POSTGRES_APP_USER', 'POSTGRES_APP_PASSWORD']) {
    const value = process.env[name]
    if (!value || value.trim() === '') {
      fail(`Variável obrigatória ausente para bootstrap local: ${name}`)
    }
  }

  const migrateUrl = `postgresql://${encodeUriComponentStrict(process.env.POSTGRES_USER)}:${encodeUriComponentStrict(process.env.POSTGRES_PASSWORD)}@db:5432/${encodeUriComponentStrict(process.env.POSTGRES_DB)}`

  runChecked('docker', ['compose', '-p', composeProjectName, 'up', '-d', 'db'])
  await waitForDatabase(composeProjectName, process.env.POSTGRES_USER, process.env.POSTGRES_DB, process.env.POSTGRES_PASSWORD)

  if (!skipMigration) {
    runChecked('docker', [
      'compose',
      '-p',
      composeProjectName,
      'run',
      '--rm',
      '--no-deps',
      '-e',
      `DATABASE_URL=${migrateUrl}`,
      'app',
      'npx',
      'prisma',
      'migrate',
      'deploy',
    ])

    setAppRolePassword(composeProjectName, migrateUrl, process.env.POSTGRES_APP_USER, process.env.POSTGRES_APP_PASSWORD)
  }

  if (!skipSeed) {
    runChecked('docker', [
      'compose',
      '-p',
      composeProjectName,
      'run',
      '--rm',
      '--no-deps',
      '-e',
      `DATABASE_URL=${migrateUrl}`,
      'app',
      'npx',
      'tsx',
      'prisma/seed.ts',
    ])
  }

  if (runDbTests) {
    runChecked('docker', [
      'compose',
      '-p',
      composeProjectName,
      'run',
      '--rm',
      '--no-deps',
      '-e',
      `DATABASE_URL=${migrateUrl}`,
      'app',
      'npm',
      'run',
      'test:db',
    ])
  }

  console.log(`Bootstrap local do banco concluído em ${composeProjectName}.`)
}

main()
