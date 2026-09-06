[CmdletBinding()]
param(
    [string]$VercelProject = 'fort-sul-sc',
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked([string]$Command, [string[]]$Arguments) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar: $Command $($Arguments -join ' ')"
    }
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw 'npm.cmd não foi encontrado. Instale a versão de Node.js exigida por package.json antes de continuar.'
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    throw 'Vercel CLI não foi encontrada. Instale-a e autentique-se antes de continuar.'
}

if (-not $SkipInstall) {
    # O lockfile garante a mesma árvore de dependências em toda worktree nova.
    Invoke-Checked 'npm.cmd' @('ci')
}

# .vercel e .env.local são locais e ignorados pelo Git; nenhuma variável é exibida.
Invoke-Checked 'vercel' @('link', '--yes', '--project', $VercelProject)

Write-Host 'Bootstrap concluído. Para abrir o Preview otimizado, execute scripts\start-preview-local.ps1.'
