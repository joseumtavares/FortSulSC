# Validação local com Preview Vercel e Supabase — 06/09/2026

Worktree: `.worktrees/claude-fatia-4-3-auth-security`.
Projeto Vercel vinculado: `fort-sul-sc`.

## Resultado desta execução

| Verificação | Resultado |
| --- | --- |
| `vercel env run -e preview -- npm.cmd run build` | Aprovado, incluindo TypeScript |
| Teste estático `node --test test-preview.mjs` | 1 aprovado |
| Vitest sem `*.integration.test.ts` | 70 testes aprovados, 28 arquivos |
| `npm run lint` | Sem erros, 4 avisos de complexidade/tamanho dos handlers |
| `npm run lint:types` | Sem erros, 34 avisos no total; revisão ainda pendente |
| GET `/` e `/admin/login` | HTTP 200 |
| GET `/admin/session-check` sem sessão | HTTP 307 para `/admin/login` |
| Cabeçalhos de segurança nas páginas | CSP, nosniff, X-Frame-Options, Referrer-Policy e Permissions-Policy presentes |
| POST senha, código e logout sem Origin ou com Origin inválido | HTTP 403 nos seis casos |
| POST senha, Origin local correto e corpo vazio | HTTP 400 |
| Formulário vazio no navegador | Mostra “Informe e-mail e senha.” |
| Administrador no Supabase | Tabela existe, mas nenhum administrador cadastrado |
| Histórico Prisma no Supabase | `_prisma_migrations` ausente; reconciliar antes de deploy de migrations |

As 24 verificações de integração não foram executadas contra este banco remoto:
suas rotinas criam e apagam registros. A aprovação acima não inclui esses testes,
o fluxo MFA real nem uma sessão autenticada.

O servidor local usa o build otimizado com `vercel env run -e preview` e
`npm run start`. Para HTTP local, somente no processo do servidor/build:
`AUTH_ORIGIN=http://localhost:3000`, `AUTH_URL=http://localhost:3000`,
`AUTH_COOKIE_SECURE=false` e `SECURITY_HEADERS_HSTS=false`.
As configurações HTTPS do `.env` e da Vercel permanecem preservadas.
A CLI combina as variáveis remotas com as locais; este teste não comprova
que a configuração exclusivamente remota está completa ou atualizada.

Avisos adicionais observados: plugin `vite-tsconfig-paths` redundante,
`scrollTo` não implementado pelo jsdom e `next start` com saída standalone.

## Próximo passo: cadastrar o administrador

No PowerShell, dentro do worktree:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\seed-preview-admin.ps1
```

O script confere o destino Supabase deste projeto, solicita o e-mail e a senha
com digitação oculta e executa o seed existente. O seed cria/atualiza as seis
categorias oficiais e cria a conta inicial. Não redefine a senha de contas já
existentes. A senha digitada não é gravada em arquivo; as variáveis temporárias
são restauradas ao terminar.

Depois, abrir `http://localhost:3000/admin/login` e testar senha, recebimento do
e-mail, validação MFA, sessão, atualização da página e logout. Registrar os
resultados reais antes de aprovar commit, merge ou push.

Não executar `prisma migrate deploy` apenas para tentar corrigir o login:
o banco já tem tabelas e o histórico de migrations precisa ser reconciliado.
