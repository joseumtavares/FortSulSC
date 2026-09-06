# Bootstrap de Worktree e Preview Local

## Regra obrigatória

Toda nova worktree de desenvolvimento do FortSulSC deve ser preparada antes de
executar testes visuais, autenticação ou alterações de código. Não copiar
`.env`, `.env.local`, `.vercel` ou credenciais entre worktrees.

O fluxo usa o lockfile para reproduzir dependências e a Vercel CLI para receber
o ambiente Preview no processo local. Arquivos locais criados pela CLI são
ignorados pelo Git e nunca devem ser lidos, exibidos ou versionados.

## Preparar uma nova worktree

No PowerShell, a partir da raiz da worktree:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-preview-worktree.ps1
```

O script executa `npm ci` e vincula a worktree ao projeto Vercel `fort-sul-sc`.
Use `-SkipInstall` somente quando `node_modules` já tiver sido criado a partir
do `package-lock.json` nesta mesma worktree.

## Iniciar o Preview otimizado

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-preview-local.ps1
```

O script executa `vercel env run -e preview`, faz o build de produção e inicia
o servidor em `http://localhost:3000`. Somente no processo local, define:

- `AUTH_ORIGIN` e `AUTH_URL` para `http://localhost:3000`;
- `AUTH_COOKIE_SECURE=false`;
- `SECURITY_HEADERS_HSTS=false`.

Essas sobreposições não alteram arquivos de ambiente nem a configuração HTTPS
do Preview. O ambiente Preview continua fornecendo a conexão Supabase e demais
integrações configuradas na Vercel.

## Diagnóstico de lentidão

Use este Preview para testes de fluxo completo. `npm run dev` é adequado para
iterações de interface, mas recompila rotas sob demanda e não é a referência de
desempenho para login, MFA ou sessão. Se o Preview otimizado continuar lento,
registrar o tempo do Route Handler para separar compilação, banco Supabase e
provedor de e-mail antes de alterar código.
