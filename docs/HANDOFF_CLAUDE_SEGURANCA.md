# Handoff para revisão do Claude — segurança e validação final

## Escopo

Revisar o estado atual da `main` após a Fatia 4.2 e a inclusão da política de segurança em `docs/Prompt_Mestre_Seguranca_Agentes.md`. Não fazer commit, merge, push, reset ou limpeza de arquivos.

## Alterações a revisar

- `next.config.ts`: CSP, HSTS apenas em produção, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`.
- `.dockerignore`: exclusão de `.worktrees` e `.git-incompleto-20260729`, reduzindo o contexto de build de aproximadamente 852 MB para 25 MB.
- `docs/Prompt_Mestre_Seguranca_Agentes.md`: política operacional de secrets, autorização, banco, headers, auditoria e LGPD.

## Evidências executadas por Jose

- Docker Desktop/Engine recuperado e saudável.
- `docker compose up -d`: `app` e `db` saudáveis.
- `docker compose exec app npx prisma migrate deploy`: 2 migrations aplicadas com sucesso.
- `docker compose exec app npx prisma db seed`: seed executado com sucesso.
- `docker compose exec --user root app npm run typecheck`: aprovado.
- `docker compose exec app npm run test:db`: 24/24 testes aprovados.
- `docker compose exec app npm run build`: compilação, TypeScript e geração estática aprovados.
- Smoke test da Home: aprovado anteriormente pelo Claude (12/12).

## Pontos para confirmar

1. HSTS está condicionado a produção para não quebrar HTTP local.
2. A CSP ainda usa `unsafe-inline` (e `unsafe-eval` somente em desenvolvimento), decisão documentada até existir nonce/middleware.
3. `partner_private` não é exposto por nenhuma rota ou UI nesta fatia.
4. Nenhuma alteração foi feita em `src/components`.
5. `npm audit` reporta 3 vulnerabilidades high transitivas na cadeia do Prisma CLI (`deepmerge-ts`); `npm audit fix --force` não deve ser executado, pois propõe downgrade do Prisma.
6. A validação de preservação CUID→UUID contra dados reais foi executada manualmente por Jose.

## Veredito solicitado

Emitir `APROVADO`, `APROVADO COM PENDÊNCIAS` ou `REPROVADO`, verificando segurança, headers, dependências e aderência à política. Se aprovado, liberar o commit/push exclusivamente por Jose.
