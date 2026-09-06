# Execute este arquivo no PowerShell para preparar o administrador de teste.
# A senha fica apenas na memoria durante o seed; nao e escrita no .env.
param([switch]$CheckOnly)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$previousPath = $env:Path
$variableNames = @('ADMIN_SEED_EMAIL', 'ADMIN_SEED_PASSWORD', 'ADMIN_SEED_RESET_PASSWORD', 'SEED_ADMIN_REQUIRED')
$previousValues = @{}
foreach ($name in $variableNames) {
    $previousValues[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

$securePassword = $null
Push-Location -LiteralPath $projectDirectory
try {
    # O Prisma inicia o tsx em outro processo. Esse processo precisa encontrar
    # os comandos instalados no projeto, sem exigir instalacao global.
    $localBin = Join-Path $projectDirectory 'node_modules\.bin'
    foreach ($commandName in @('prisma.cmd', 'tsx.cmd')) {
        if (-not (Test-Path -LiteralPath (Join-Path $localBin $commandName))) {
            throw 'Dependencia local ausente. Execute npm ci antes de repetir o seed.'
        }
    }
    $env:Path = $localBin + [IO.Path]::PathSeparator + $previousPath

    # Confere o destino antes de criar dados. Nao imprime a URL nem a senha.
    $checkDestination = @'
const fs = require('fs');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('.env', 'utf8'));
try {
  const url = new URL(process.env.DATABASE_URL || env.DATABASE_URL);
  if (env.DATABASE_PLATFORM !== 'supabase' ||
      !url.hostname.endsWith('.pooler.supabase.com') ||
      url.username !== 'postgres.qhttphrfozrwgurnlmni') {
    throw new Error();
  }
  console.log('Destino conferido: Supabase de teste deste projeto.');
} catch {
  console.error('Destino inesperado. Confira DATABASE_PLATFORM e DATABASE_URL antes do seed.');
  process.exitCode = 1;
}
'@
    & node -e $checkDestination
    if ($LASTEXITCODE -ne 0) { throw 'O destino do banco nao foi confirmado.' }

    # Verifica a mesma busca de comandos usada pelo processo filho do Prisma.
    # Nao solicita senha e nao cria dados quando -CheckOnly estiver presente.
    if ($CheckOnly) {
        & cmd.exe /d /c 'tsx --version'
        if ($LASTEXITCODE -ne 0) { throw 'O processo filho nao conseguiu executar tsx.' }
        Write-Host 'Dependencias verificadas. Nenhum dado foi criado.'
        return
    }

    # Use o e-mail que deve receber os codigos MFA.
    $email = (Read-Host 'E-mail do administrador').Trim().ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($email) -or $email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
        throw 'Digite um endereco de e-mail completo.'
    }

    # Escolha uma senha para o LOGIN do site, diferente da senha do banco.
    $securePassword = Read-Host 'Senha para entrar no site (digitacao oculta)' -AsSecureString
    if ($securePassword.Length -eq 0) { throw 'A senha nao pode ficar vazia.' }

    $env:ADMIN_SEED_EMAIL = $email
    $env:ADMIN_SEED_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password
    $env:ADMIN_SEED_RESET_PASSWORD = 'false'
    $env:SEED_ADMIN_REQUIRED = 'true'

    # Usa o seed ja existente: cria as seis categorias e o administrador.
    # Se a conta ja existir, este comando preserva a senha cadastrada.
    & '.\node_modules\.bin\prisma.cmd' db seed
    if ($LASTEXITCODE -ne 0) { throw 'O seed falhou. Confira a mensagem anterior.' }
    Write-Host 'Seed concluido. Agora teste http://localhost:3000/admin/login'
}
finally {
    # Restaura o caminho de comandos e as variaveis anteriores.
    $env:Path = $previousPath
    foreach ($name in $variableNames) {
        [Environment]::SetEnvironmentVariable($name, $previousValues[$name], 'Process')
    }
    if ($null -ne $securePassword) { $securePassword.Dispose() }
    $securePassword = $null
    $previousValues.Clear()
    Pop-Location
}
