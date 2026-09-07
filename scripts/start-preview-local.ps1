[CmdletBinding()]
param(
    [ValidateSet('preview', 'development', 'production')]
    [string]$VercelEnvironment = 'preview'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath 'node_modules')) {
    throw 'Dependências ausentes. Execute scripts\bootstrap-preview-worktree.ps1 nesta worktree primeiro.'
}

if (-not (Get-Command vercel.cmd -ErrorAction SilentlyContinue)) {
    throw 'Vercel CLI não foi encontrada. Execute o bootstrap após instalar e autenticar a CLI.'
}

function Invoke-VercelNpm([ValidateSet('build', 'start')][string]$NpmScript) {
    # As sobreposições existem somente no processo local: Preview permanece HTTPS.
    $env:AUTH_ORIGIN = 'http://localhost:3000'
    $env:AUTH_URL = 'http://localhost:3000'
    $env:AUTH_COOKIE_SECURE = 'false'
    $env:SECURITY_HEADERS_HSTS = 'false'

    & vercel.cmd env run -e $VercelEnvironment -- npm.cmd run $NpmScript
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no npm run $NpmScript usando o ambiente Vercel $VercelEnvironment."
    }
}

Invoke-VercelNpm 'build'
Invoke-VercelNpm 'start'
