# Bootstrap de Worktree e Preview Local

## Regra obrigatória

Toda nova worktree de desenvolvimento do FortSulSC deve ser preparada antes de
executar testes visuais, autenticação ou alterações de código. Não copiar
`.env`, `.env.local`, `.vercel` ou credenciais entre worktrees.

Todo teste local via Docker Compose que envolva login administrativo deve usar
`EMAIL_PROVIDER=resend` com `RESEND_API_KEY` e `RESEND_FROM_EMAIL` reais (uma
chave de teste/sandbox do Resend é suficiente) no `.env` da própria worktree.
`EMAIL_PROVIDER=console` nunca deve ser usado para testar o fluxo de login: o
código MFA não é gravado em nenhum log ou tabela em texto puro — por
segurança, é só simulado — então não existe forma de recuperá-lo
manualmente nesse modo. `docker-compose.yaml` passou a exigir essas três
variáveis explicitamente (sem valor padrão) para que a ausência de
configuração falhe de forma clara ao subir o serviço, em vez de cair
silenciosamente em modo simulado. Essa exigência só vale para worktrees
criadas a partir de uma `main` que já contém essa mudança — confirme que o
commit que a introduziu foi mesclado antes de assumir que uma worktree nova
vai falhar rápido em vez de cair em modo simulado.

Prefira nunca digitar `RESEND_API_KEY`, senhas de seed ou outros segredos à
mão em conversas com agentes (chat, ticket, PR): cole-os só diretamente no
`.env` local. Qualquer segredo que apareça em texto de conversa deve ser
tratado como comprometido e rotacionado no provedor (Resend, banco, etc.)
assim que possível.

O caminho mais rápido e mais alinhado ao ambiente remoto para obter essas
variáveis (em vez de digitá-las à mão) é o fluxo de Preview otimizado abaixo
(`scripts/start-preview-local.mjs`), que usa `vercel env run` para trazer os
valores reais do ambiente Preview da Vercel — incluindo `RESEND_API_KEY` — em
vez de valores inventados localmente, reduzindo divergência entre o teste
local e o ambiente remoto.

O fluxo usa o lockfile para reproduzir dependências e a Vercel CLI para receber
o ambiente Preview no processo local. Arquivos locais criados pela CLI são
ignorados pelo Git e nunca devem ser lidos, exibidos ou versionados.

## Preparar uma nova worktree

A partir da raiz da worktree (Linux, macOS ou Windows — os scripts são Node
puro, sem dependência de PowerShell):

```bash
node scripts/bootstrap-preview-worktree.mjs
```

O script executa `npm ci` e vincula a worktree ao projeto Vercel `fort-sul-sc`.
Use `--skip-install` somente quando `node_modules` já tiver sido criado a
partir do `package-lock.json` nesta mesma worktree. Use `--project <nome>`
para vincular a um projeto Vercel diferente do padrão.

O bootstrap valida antes de instalar que `package.json`, `package-lock.json`,
`tsconfig.json`, `next.config.ts` e `next-env.d.ts` são arquivos regulares. Se
um arquivo esperado existir como diretório, o bootstrap para imediatamente. Não
avance para Docker, Prisma ou testes tentando contornar esse erro: corrija a
estrutura da worktree e repita o bootstrap.

## Falhas recorrentes e soluções comprovadas

| Sintoma | Causa provável | Solução comprovada | Prevenção |
|---|---|---|---|
| `EISDIR` ao abrir `next-env.d.ts` durante `next build` | `next-env.d.ts` foi criado como diretório vazio na worktree | Remover somente o diretório vazio e restaurar o arquivo canônico da raiz; repetir o build e o fluxo completo de banco | O bootstrap valida `-PathType Leaf` antes de instalar ou iniciar Docker |
| Prisma Client sem modelos novos em Vercel/ambiente limpo | O build executou TypeScript antes de gerar o client a partir do schema atual | Executar `prisma generate` antes de `next build --webpack` no script de build | Validar o build em worktree limpa; nunca confiar no client herdado de `node_modules` |
| `prisma generate` falha por `DATABASE_URL` ausente durante build | `prisma.config.ts` tenta carregar datasource em uma etapa que só precisa gerar tipos | Omitir o datasource quando a URL não existe e fornecer URL fictícia de build apenas no estágio Docker que coleta rotas | Separar variáveis de build, runtime e migration; nunca colocar credencial real em Dockerfile ou documentação |
| `npm run test:db` usa banco/papel errado ou falha após migration | `DATABASE_URL` da sessão aponta para Supabase ou para o papel restrito; volume local antigo não possui as roles esperadas | Usar projeto Compose isolado da worktree, seed oficial antes dos testes, URL do papel proprietário para migrations e papel restrito para runtime/testes | Bootstrap reproduzível; declarar explicitamente qual URL cada comando usa |
| Seed termina sem erro, mas as categorias não aparecem | Neste stack, `prisma db seed` pode terminar como no-op dependendo da worktree/configuração, sem executar efetivamente `prisma/seed.ts` | Executar `npx tsx prisma/seed.ts` diretamente, com `COMPOSE_PROJECT_NAME` isolado por worktree; alinhar o comando do Compose e o script de seed administrativo ao mesmo caminho explícito | Não aceitar saída 0 como prova de seed; confirmar as seis categorias e executar `npm run test:db` no mesmo projeto Compose |
| Git não reconhece branch em worktree revisada pelo WSL | `.git` contém `gitdir` com caminho Windows/WSL incompatível com o ambiente que está lendo | Corrigir o apontamento do `gitdir` para o formato do ambiente que executa o Git, sem alterar código ou histórico | Criar/revisar worktrees no mesmo ambiente; se alternar Windows/WSL, validar `.git` antes da revisão |
| `tsx`, Prisma ou outros binários locais não são encontrados ao rodar um script | O comando tentou resolver o binário direto (`./node_modules/.bin/...`), sem passar pelo `npx` | Os scripts `.mjs` em `scripts/` usam `npx --no-install <comando>`, que resolve pela árvore local sem depender de extensão de plataforma (`.cmd` no Windows) | Rodar `npm ci` na própria worktree antes de qualquer script; preferir `npx --no-install` a caminho manual de binário |
| Login manual trava no passo do código MFA; "Credenciais inválidas" mesmo com senha certa | (1) `ADMIN_SEED_PASSWORD` desta worktree é diferente da senha usada em outra worktree/produção — `.env` não é compartilhado entre worktrees; (2) com `EMAIL_PROVIDER=console`, o código MFA nunca é gravado em log ou banco em texto puro, por segurança — não há como recuperá-lo manualmente | Usar a senha definida no `.env` desta worktree; configurar `EMAIL_PROVIDER=resend` com `RESEND_API_KEY`/`RESEND_FROM_EMAIL` reais para receber o código por e-mail de verdade | `docker-compose.yaml` exige essas variáveis sem valor padrão; nunca aceitar "não recebi o código" como bug antes de confirmar o `EMAIL_PROVIDER` configurado |
| `docker compose up -d <serviço>` sobe "healthy" mas a porta publicada não responde (`curl` dá conexão recusada, `docker inspect .NetworkSettings.Ports` vem vazio mesmo com `HostConfig.PortBindings` preenchido) | Publicação de porta ficou presa após remover à força (`docker rm -f`) um container anterior que usava a mesma porta/host, sem erro visível na recriação seguinte | `docker compose rm -sf <serviço>` seguido de `docker compose up -d --force-recreate <serviço>` força uma publicação de porta limpa | Preferir `docker compose down`/`stop` ao encerrar um serviço de teste, em vez de `docker rm -f`, quando outra recriação na mesma porta for seguir depois |

As correções acima foram confirmadas durante as Fatias 4.1 a 4.6. Tentativas
parciais, como apenas repetir o Docker, copiar `.env` entre worktrees ou usar o
`node_modules` da raiz, aceitar `prisma db seed` apenas porque retornou código 0
ou reutilizar o volume de outra worktree, não são consideradas solução e não
devem ser repetidas.

As propostas antigas podem conter o comando histórico `prisma db seed`. Para o
fluxo operacional atual, ele está supersedido pelo seed explícito via `tsx` até
que a configuração do Prisma seja corrigida e validada novamente. O critério de
sucesso é dado verificável no banco e `npm run test:db` aprovado, não apenas a
ausência de erro no comando.

Se a tarefa tocar Prisma, migrations ou `test:db`, prepare também o banco local
isolado desta worktree:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-local-db.ps1
```

Esse bootstrap usa um nome de projeto do Docker Compose derivado da worktree
atual, para não reutilizar o volume de outra branch nem repetir seed/migration
em banco compartilhado por acidente.

## Iniciar o Preview otimizado

```bash
node scripts/start-preview-local.mjs
```

Use `--env development` ou `--env production` para trocar o ambiente Vercel
usado (o padrão é `preview`).

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
