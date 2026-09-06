[CmdletBinding()]
param(
    [ValidateSet('preview', 'development', 'production')]
    [string]$VercelEnvironment = 'preview'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath 'node_modules')) {
    throw 'Dependências ausentes. Execute scripts\bootstrap-preview-worktree.ps1 nesta worktree primeiro.'
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    throw 'Vercel CLI não foi encontrada. Execute o bootstrap após instalar e autenticar a CLI.'
}

function Invoke-VercelNpm([ValidateSet('build', 'start')][string]$NpmScript) {
    # As sobreposições existem somente no processo local: Preview permanece HTTPS.
    $nodeScript = @"
Object.assign(process.env, {
  AUTH_ORIGIN: 'http://localhost:3000',
  AUTH_URL: 'http://localhost:3000',
  AUTH_COOKIE_SECURE: 'false',
  SECURITY_HEADERS_HSTS: 'false'
});
const result = require('node:child_process').spawnSync('npm.cmd run $NpmScript', {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
"@
    $encodedScript = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($nodeScript))
    $command = "vercel env run -e $VercelEnvironment -- node -e `"eval(Buffer.from('$encodedScript', 'base64').toString('utf8'))`""

    & cmd.exe /d /c $command
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no npm run $NpmScript usando o ambiente Vercel $VercelEnvironment."
    }
}

Invoke-VercelNpm 'build'
Invoke-VercelNpm 'start'
