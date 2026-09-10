#!/usr/bin/env node
// Prepara uma worktree nova: valida artefatos obrigatórios, instala
// dependências pelo lockfile e vincula a worktree ao projeto Vercel.
// Substitui bootstrap-preview-worktree.ps1 (Windows-only) por uma versão
// que roda igual em Linux, macOS e Windows.

import { existsSync, lstatSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const skipInstall = args.includes('--skip-install')
const projectFlagIndex = args.indexOf('--project')
const vercelProject = projectFlagIndex !== -1 ? args[projectFlagIndex + 1] : 'fort-sul-sc'

function fail(message) {
  console.error(`Erro: ${message}`)
  process.exit(1)
}

function assertRequiredFile(relativePath) {
  const fullPath = path.join(projectRoot, relativePath)
  if (!existsSync(fullPath)) {
    fail(`Arquivo obrigatório ausente: '${relativePath}'. A worktree não está pronta para o bootstrap.`)
  }
  const stats = lstatSync(fullPath)
  if (!stats.isFile()) {
    fail(
      `Artefato inválido: '${relativePath}' existe como diretório, mas precisa ser um arquivo. ` +
        'Remova somente o diretório vazio e restaure o arquivo canônico antes de continuar.',
    )
  }
}

// next-env.d.ts é gerado pelo Next.js e ignorado pelo Git (.gitignore) — uma
// worktree nova legitimamente nasce sem ele, antes do primeiro `next dev`/
// `next build`. Diferente de assertRequiredFile, não tratamos a ausência como
// erro: recriamos o conteúdo padrão (sem nada específico do projeto) para não
// bloquear o bootstrap. Se o caminho existir como diretório, isso ainda é uma
// falha real (ver tabela de falhas recorrentes) e continua parando o script.
const NEXT_ENV_CONTENT = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`

function ensureNextEnvFile() {
  const fullPath = path.join(projectRoot, 'next-env.d.ts')
  if (!existsSync(fullPath)) {
    writeFileSync(fullPath, NEXT_ENV_CONTENT)
    return
  }
  const stats = lstatSync(fullPath)
  if (!stats.isFile()) {
    fail(
      "Artefato inválido: 'next-env.d.ts' existe como diretório, mas precisa ser um arquivo. " +
        'Remova somente o diretório vazio antes de continuar; o bootstrap recria o conteúdo padrão.',
    )
  }
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore', shell: true })
  return !result.error && result.status === 0
}

function runChecked(command, commandArgs, errorMessage) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: true, cwd: projectRoot })
  if (result.status !== 0) {
    fail(errorMessage ?? `Falha ao executar: ${command} ${commandArgs.join(' ')}`)
  }
}

for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts']) {
  assertRequiredFile(file)
}
ensureNextEnvFile()

if (!commandExists('npm')) {
  fail('npm não foi encontrado. Instale a versão de Node.js exigida por package.json antes de continuar.')
}

if (!commandExists('vercel')) {
  fail('Vercel CLI não foi encontrada. Instale-a (npm i -g vercel) e autentique-se antes de continuar.')
}

if (!skipInstall) {
  // O lockfile garante a mesma árvore de dependências em toda worktree nova.
  runChecked('npm', ['ci'])
}

// .vercel e .env.local são locais e ignorados pelo Git; nenhuma variável é exibida.
runChecked('vercel', ['link', '--yes', '--project', vercelProject])

console.log('Bootstrap concluído. Para abrir o Preview otimizado, execute: node scripts/start-preview-local.mjs')
