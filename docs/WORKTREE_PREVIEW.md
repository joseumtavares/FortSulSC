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

`.env` e `.env.local` não são intercambiáveis, mesmo sendo os dois
gitignored: `docker-compose.yaml` e `prisma.config.ts` só leem `.env` (nunca
`.env.local`); `.env.local` é gerado pela Vercel CLI e, nesta fase, só deve
conter `VERCEL_OIDC_TOKEN` — variáveis de Postgres/Docker/app coladas ali por
engano ficam invisíveis para Compose e para o CLI do Prisma, sem nenhum erro
óbvio que aponte para o arquivo errado. Sempre confirmar com
`test -f .env && grep -oE "^[A-Z_]+=" .env` (nomes de chave, nunca valores)
qual arquivo já tem o quê antes de editar ou depurar.

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
`tsconfig.json` e `next.config.ts` são arquivos regulares. Se um arquivo
esperado existir como diretório, o bootstrap para imediatamente. Não avance
para Docker, Prisma ou testes tentando contornar esse erro: corrija a
estrutura da worktree e repita o bootstrap.

`next-env.d.ts` é tratado à parte: é gerado pelo Next.js e ignorado pelo Git
(`.gitignore`), então uma worktree nova legitimamente nasce sem ele. O
bootstrap recria o conteúdo padrão automaticamente quando o arquivo não
existe; só para o script se o caminho existir como diretório (mesma falha
`EISDIR` da tabela abaixo).

## Falhas recorrentes e soluções comprovadas

| Sintoma | Causa provável | Solução comprovada | Prevenção |
|---|---|---|---|
| `EISDIR` ao abrir `next-env.d.ts` durante `next build` | `next-env.d.ts` foi criado como diretório vazio na worktree | Remover somente o diretório vazio e restaurar o arquivo canônico da raiz; repetir o build e o fluxo completo de banco | O bootstrap valida `-PathType Leaf` antes de instalar ou iniciar Docker |
| Bootstrap falha com "Arquivo obrigatório ausente: 'next-env.d.ts'" em worktree recém-criada | `next-env.d.ts` é gerado pelo Next.js e ignorado pelo Git — uma worktree nova (`git worktree add`) nunca o tem antes do primeiro `next dev`/`next build`; a versão antiga do bootstrap exigia o arquivo já existente e falhava | Corrigido em `scripts/bootstrap-preview-worktree.mjs`: o bootstrap agora recria o conteúdo padrão de `next-env.d.ts` automaticamente quando ele está ausente, só falhando se o caminho existir como diretório (mesma checagem `EISDIR` da linha acima) | Nenhuma ação manual necessária a partir desta correção; se o bootstrap ainda falhar citando este arquivo, confirmar que a worktree está usando a versão atual do script |
| Prisma Client sem modelos novos em Vercel/ambiente limpo | O build executou TypeScript antes de gerar o client a partir do schema atual | Executar `prisma generate` antes de `next build --webpack` no script de build | Validar o build em worktree limpa; nunca confiar no client herdado de `node_modules` |
| `prisma generate` falha por `DATABASE_URL` ausente durante build | `prisma.config.ts` tenta carregar datasource em uma etapa que só precisa gerar tipos | Omitir o datasource quando a URL não existe e fornecer URL fictícia de build apenas no estágio Docker que coleta rotas | Separar variáveis de build, runtime e migration; nunca colocar credencial real em Dockerfile ou documentação |
| `npm run test:db` usa banco/papel errado ou falha após migration | `DATABASE_URL` da sessão aponta para Supabase ou para o papel restrito; volume local antigo não possui as roles esperadas | Usar projeto Compose isolado da worktree, seed oficial antes dos testes, URL do papel proprietário para migrations e papel restrito para runtime/testes | Bootstrap reproduzível; declarar explicitamente qual URL cada comando usa |
| Seed termina sem erro, mas as categorias não aparecem | Neste stack, `prisma db seed` pode terminar como no-op dependendo da worktree/configuração, sem executar efetivamente `prisma/seed.ts` | Executar `npx tsx prisma/seed.ts` diretamente, com `COMPOSE_PROJECT_NAME` isolado por worktree; alinhar o comando do Compose e o script de seed administrativo ao mesmo caminho explícito | Não aceitar saída 0 como prova de seed; confirmar as seis categorias e executar `npm run test:db` no mesmo projeto Compose |
| Git não reconhece branch em worktree revisada pelo WSL | `.git` contém `gitdir` com caminho Windows/WSL incompatível com o ambiente que está lendo | Corrigir o apontamento do `gitdir` para o formato do ambiente que executa o Git, sem alterar código ou histórico | Criar/revisar worktrees no mesmo ambiente; se alternar Windows/WSL, validar `.git` antes da revisão |
| `tsx`, Prisma ou outros binários locais não são encontrados ao rodar um script | O comando tentou resolver o binário direto (`./node_modules/.bin/...`), sem passar pelo `npx` | Os scripts `.mjs` em `scripts/` usam `npx --no-install <comando>`, que resolve pela árvore local sem depender de extensão de plataforma (`.cmd` no Windows) | Rodar `npm ci` na própria worktree antes de qualquer script; preferir `npx --no-install` a caminho manual de binário |
| Login manual trava no passo do código MFA; "Credenciais inválidas" mesmo com senha certa | (1) `ADMIN_SEED_PASSWORD` desta worktree é diferente da senha usada em outra worktree/produção — `.env` não é compartilhado entre worktrees; (2) com `EMAIL_PROVIDER=console`, o código MFA nunca é gravado em log ou banco em texto puro, por segurança — não há como recuperá-lo manualmente | Usar a senha definida no `.env` desta worktree; configurar `EMAIL_PROVIDER=resend` com `RESEND_API_KEY`/`RESEND_FROM_EMAIL` reais para receber o código por e-mail de verdade | `docker-compose.yaml` exige essas variáveis sem valor padrão; nunca aceitar "não recebi o código" como bug antes de confirmar o `EMAIL_PROVIDER` configurado |
| Login (ou qualquer rota administrativa) retornava "Não foi possível iniciar o login. Tente novamente em instantes." (log só mostrava `auth.password_login_unavailable`, sem detalhe) logo após recriar o volume Postgres do zero — **corrigido, ver histórico abaixo** | A migration `20260904031500_fatia_4_3_admin_auth_security` cria a role restrita `fortsul_app` **sem senha**, de propósito (evita commitar segredo em SQL versionado); a própria migration documentava a exigência de rodar manualmente, fora do controle de versão, `ALTER ROLE fortsul_app WITH PASSWORD '<POSTGRES_APP_PASSWORD>'` depois de aplicar as migrations. Sem esse passo, `DATABASE_URL` do serviço `app` (que usa essa role) falhava a autenticação em toda query, e o catch genérico da rota de login escondia o erro real | `scripts/bootstrap-local-db.mjs` e `scripts/bootstrap-local-db.ps1` agora rodam esse `ALTER ROLE` automaticamente, logo depois do `migrate deploy` e antes do seed, usando a role proprietária para executá-lo e passando a senha só via stdin do `prisma db execute` (nunca por argumento, log ou stdout). Nenhuma ação manual é necessária ao usar os bootstraps | Sempre preparar o banco local via `node scripts/bootstrap-local-db.mjs` (ou o `.ps1`), nunca subindo `db`/rodando migrate à mão; se este sintoma reaparecer, confirmar que a worktree está usando a versão atual dos scripts |
| `docker compose up -d <serviço>` sobe "healthy" mas a porta publicada não responde (`curl` dá conexão recusada, `docker inspect .NetworkSettings.Ports` vem vazio mesmo com `HostConfig.PortBindings` preenchido) | Publicação de porta ficou presa após remover à força (`docker rm -f`) um container anterior que usava a mesma porta/host, sem erro visível na recriação seguinte | `docker compose rm -sf <serviço>` seguido de `docker compose up -d --force-recreate <serviço>` força uma publicação de porta limpa | Preferir `docker compose down`/`stop` ao encerrar um serviço de teste, em vez de `docker rm -f`, quando outra recriação na mesma porta for seguir depois |
| `npm run test:db` rodado direto no host falha com "Environment variable not found: DATABASE_URL" mesmo com o `.env`/`.env.local` preenchido | `vitest run src/lib/db` não carrega nenhum arquivo de variáveis sozinho — diferente de `next dev`/`next build`, que carregam `.env.local`/`.env` automaticamente; `prisma.config.ts` só carrega `.env` e só quando um comando do CLI do Prisma roda, nunca quando o Vitest roda | `vitest.setup.ts` carrega `dotenv` com `path: ['.env.local', '.env']` (mesma ordem de prioridade do Next.js) antes de qualquer teste | Nunca supor que um arquivo de env é lido automaticamente só porque `next dev` funciona; cada ferramenta (Compose, Prisma CLI, Vitest, Next.js) lê um conjunto próprio de arquivos |
| Depois de corrigir a variável, o erro muda para "Database `<nome>` does not exist" | O volume Postgres da worktree já foi inicializado antes com `POSTGRES_USER`/`POSTGRES_DB` diferentes dos que estão agora no `.env` — a imagem `postgres` só roda os scripts de criação de usuário/banco na primeira inicialização de um volume vazio; editar o `.env` depois não recria nada dentro de um volume já existente | `COMPOSE_PROJECT_NAME=<projeto> docker compose down -v` seguido de `docker compose up -d db` recria o volume do zero já alinhado ao `.env` atual — seguro nesta fase por ser banco local descartável, sem dado real | Antes de depurar a `DATABASE_URL`, confirmar o nome real do banco/usuário já inicializado com `docker exec <container> sh -c 'psql -U "$POSTGRES_USER" -l'` (usa as variáveis internas do próprio container; nunca imprime senha) |
| `docker compose down`/`up`/`exec` roda com sucesso (exit code 0) mas não afeta o container esperado da worktree | O container foi criado com um `COMPOSE_PROJECT_NAME` explícito (isolado por worktree) que não está exportado na sessão atual; sem ele, o Compose usa o nome de projeto padrão (derivado do diretório atual, um projeto diferente e vazio), então "down" não erra, só não faz nada | Sempre passar `-p <nome>` ou exportar `COMPOSE_PROJECT_NAME=<nome>` igual ao que criou o container original; confirmar o nome real com `docker inspect <container> --format '{{index .Config.Labels "com.docker.compose.project"}}'` antes de qualquer `docker compose down/up/exec` | Usar sempre a convenção de `scripts/bootstrap-local-db.mjs`/`.ps1` (`fortsulsc-<slug-do-nome-da-pasta-da-worktree>`) — nunca deixar o Compose escolher o nome padrão nem inventar um nome ad hoc na hora |
| `npm run test:db` rodado direto no host falha por porta/papel/banco mesmo com `.env`, volume e `COMPOSE_PROJECT_NAME` corretos | O fluxo comprovado (`scripts/bootstrap-local-db.mjs`/`.ps1`) nunca roda migrate/seed/test:db no host — sempre via `docker compose run --rm --no-deps -e DATABASE_URL=... app <comando>`, porque (1) o hostname interno `db` só resolve dentro da rede do Compose, não em `localhost`/porta publicada; e (2) a role restrita (`fortsul_app`) só existe depois que a migration que a cria roda com a role proprietária (`POSTGRES_USER`) — migração e testes de integração sempre usam a role proprietária, nunca a role de runtime | Reproduzir o mesmo padrão: subir só o `db` (`docker compose -p <projeto> up -d db`), aguardar `pg_isready`, depois rodar migrate/seed/test:db via `docker compose -p <projeto> run --rm --no-deps -e DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@db:5432/<POSTGRES_DB> app <comando>` | O fluxo já tem porte Node/cross-platform (`scripts/bootstrap-local-db.mjs`), além do `.ps1` original — usar sempre um dos dois em vez de reproduzir o fluxo à mão evita justamente os pontos acima |
| **[Grave] `npm run test:db` rodado direto no host não falha — roda de verdade contra o Supabase de produção**, criando/apagando linhas de teste em `categories`, `regions`, `states`, `municipalities`, `partners`, `commercial_areas` em dados reais | `.env.local` do checkout principal tinha um `DATABASE_URL` apontando direto para o pooler do Supabase de produção (`aws-0-*.pooler.supabase.com`), deixado de uma sessão de diagnóstico via Supabase MCP; como `vitest.setup.ts` carrega `.env.local` antes de `.env`, um `vitest run src/lib/db` no host encontra essa URL válida e conecta nela silenciosamente — não é o erro "DATABASE_URL ausente" da linha acima, é sucesso contra o banco errado. O serviço `app` do Compose nunca usa esse valor (recebe `DATABASE_URL` própria, fixa em `db:5432`, injetada pelo `docker-compose.yaml`) — ou seja, não existe motivo legítimo para `.env.local` ter essa chave | Remover/comentar `DATABASE_URL` do `.env.local` (e nunca colocar lá uma connection string de produção); rodar test:db **só** via `node scripts/bootstrap-local-db.mjs --RunDbTests`, que injeta a URL do Postgres local dentro da rede do Compose e ignora `.env.local` por completo; limpar qualquer linha de teste já gravada em produção via Supabase MCP (`execute_sql` com os IDs exatos, nunca `DELETE` por padrão amplo) | Nunca colar uma `DATABASE_URL` de produção em `.env`/`.env.local` por conveniência, nem para uso "temporário" — antes de qualquer `vitest run src/lib/db`/`prisma studio`/`prisma db execute` manual no host, conferir com `grep -c "^DATABASE_URL=" .env.local` (sem imprimir o valor) se existe alguma URL ativa e de que ambiente ela é |

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
isolado desta worktree. Em Linux, macOS ou Windows (script Node puro, preferido):

```bash
node scripts/bootstrap-local-db.mjs
```

Em Windows nativo, a alternativa em PowerShell continua disponível:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-local-db.ps1
```

Os dois scripts implementam a mesma lógica: nome de projeto do Docker Compose
derivado da worktree atual (para não reutilizar o volume de outra branch nem
repetir seed/migration em banco compartilhado por acidente), `.env` carregado
apenas no processo, validação de `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB`, `POSTGRES_APP_USER` e `POSTGRES_APP_PASSWORD`, subida apenas do
serviço `db`, espera por `pg_isready` e migrate/seed/test:db executados dentro
da rede do Compose (`docker compose run --rm --no-deps ... app <comando>`) com
a role proprietária — nunca a partir do host nem com a role restrita
`fortsul_app`. Logo depois do `migrate deploy` e antes do seed, os dois também
rodam `ALTER ROLE fortsul_app WITH PASSWORD ...` automaticamente com a role
proprietária, passando a senha só via stdin do `prisma db execute` (nunca por
argumento, log ou stdout) — nenhum passo manual é necessário mesmo recriando o
volume do zero (ver histórico na tabela de falhas recorrentes acima). As
mesmas flags existem nos dois: `--SkipMigration`, `--SkipSeed` e
`--RunDbTests` (script Node) equivalem a `-SkipMigration`, `-SkipSeed` e
`-RunDbTests` (script PowerShell).

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
