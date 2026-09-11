[CmdletBinding()]
param(
    [switch]$SkipMigration,
    [switch]$SkipSeed,
    [switch]$RunDbTests
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked([string]$Command, [string[]]$Arguments) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar: $Command $($Arguments -join ' ')"
    }
}

function Import-DotEnv([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith('#')) {
            continue
        }

        $separatorIndex = $line.IndexOf('=')
        if ($separatorIndex -lt 1) {
            continue
        }

        $name = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1)
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Get-ComposeProjectName([string]$ProjectDirectory) {
    $leaf = Split-Path -Leaf $ProjectDirectory
    if ($leaf -eq '.worktrees') {
        $leaf = Split-Path -Leaf (Split-Path -Parent $ProjectDirectory)
    }

    $normalized = $leaf.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
    $normalized = $normalized.Trim('-')
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        $normalized = 'worktree'
    }

    return "fortsulsc-$normalized"
}

function Wait-ForDatabase([string]$ComposeProjectName, [string]$DatabaseUser, [string]$DatabaseName, [string]$DatabasePassword) {
    $tries = 30
    for ($attempt = 1; $attempt -le $tries; $attempt++) {
        & docker compose -p $ComposeProjectName exec -T db env PGPASSWORD=$DatabasePassword pg_isready -U $DatabaseUser -d $DatabaseName | Out-Null
        if ($LASTEXITCODE -eq 0) {
            return
        }

        Start-Sleep -Seconds 2
    }

    throw 'O Postgres local não ficou pronto a tempo.'
}

function Set-AppRolePassword([string]$ComposeProjectName, [string]$MigrateUrl, [string]$AppUser, [string]$AppPassword) {
    # A migration fatia_4_3 cria a role restrita fortsul_app sem senha de
    # propósito (nenhum segredo em SQL versionado); sem este passo, todo
    # volume novo nasce com a role sem senha e a aplicação falha a
    # autenticação em toda query. Idempotente: ALTER ROLE ... WITH PASSWORD
    # é seguro de repetir. A senha nunca é passada por argumento nem
    # aparece em log — vai só pelo stdin do `prisma db execute`, dentro do
    # SQL, usando a role proprietária (via DATABASE_URL/$MigrateUrl).
    $escapedUser = $AppUser -replace '"', '""'
    $escapedPassword = $AppPassword -replace "'", "''"
    $sql = "ALTER ROLE ""$escapedUser"" WITH PASSWORD '$escapedPassword';"

    $sql | & docker compose -p $ComposeProjectName run --rm --no-deps -e "DATABASE_URL=$MigrateUrl" app npx prisma db execute --schema=prisma/schema.prisma --stdin
    if ($LASTEXITCODE -ne 0) {
        throw 'Falha ao definir a senha da role fortsul_app (ALTER ROLE).'
    }
}

$projectDirectory = Split-Path -Parent $PSScriptRoot
$composeProjectName = Get-ComposeProjectName $projectDirectory
$repoRoot = if ((Split-Path -Leaf (Split-Path -Parent $projectDirectory)) -eq '.worktrees') {
    Split-Path -Parent (Split-Path -Parent $projectDirectory)
} else {
    $projectDirectory
}

$localEnvPath = Join-Path $projectDirectory '.env'
$fallbackEnvPath = Join-Path $repoRoot '.env'
if (Test-Path -LiteralPath $localEnvPath) {
    Import-DotEnv $localEnvPath
} else {
    Import-DotEnv $fallbackEnvPath
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'docker não foi encontrado. Abra uma sessão com Docker Desktop acessível antes de continuar.'
}

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw 'Docker CLI encontrada, mas o Docker Desktop/engine Linux não está disponível. Inicie o Docker Desktop e aguarde o status Running antes de continuar.'
}

foreach ($name in @('POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'POSTGRES_APP_USER', 'POSTGRES_APP_PASSWORD')) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
        throw "Variável obrigatória ausente para bootstrap local: $name"
    }
}

$encodedUser = [Uri]::EscapeDataString($env:POSTGRES_USER)
$encodedPassword = [Uri]::EscapeDataString($env:POSTGRES_PASSWORD)
$encodedDatabase = [Uri]::EscapeDataString($env:POSTGRES_DB)
$migrateUrl = "postgresql://$encodedUser`:$encodedPassword@db:5432/$encodedDatabase"

Push-Location -LiteralPath $projectDirectory
try {
    Invoke-Checked 'docker' @('compose', '-p', $composeProjectName, 'up', '-d', 'db')
    Wait-ForDatabase $composeProjectName $env:POSTGRES_USER $env:POSTGRES_DB $env:POSTGRES_PASSWORD

    if (-not $SkipMigration) {
        Invoke-Checked 'docker' @('compose', '-p', $composeProjectName, 'run', '--rm', '--no-deps', '-e', "DATABASE_URL=$migrateUrl", 'app', 'npx', 'prisma', 'migrate', 'deploy')
        Set-AppRolePassword $composeProjectName $migrateUrl $env:POSTGRES_APP_USER $env:POSTGRES_APP_PASSWORD
    }

    if (-not $SkipSeed) {
        Invoke-Checked 'docker' @('compose', '-p', $composeProjectName, 'run', '--rm', '--no-deps', '-e', "DATABASE_URL=$migrateUrl", 'app', 'npx', 'tsx', 'prisma/seed.ts')
    }

    if ($RunDbTests) {
        Invoke-Checked 'docker' @('compose', '-p', $composeProjectName, 'run', '--rm', '--no-deps', '-e', "DATABASE_URL=$migrateUrl", 'app', 'npm', 'run', 'test:db')
    }
}
finally {
    Pop-Location
}

Write-Host "Bootstrap local do banco concluído em $composeProjectName."
