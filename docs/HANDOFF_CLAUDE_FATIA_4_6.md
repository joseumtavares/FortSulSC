# Handoff para revisão do Claude — Fatia 4.6

## Status

`IMPLEMENTADO — AGUARDANDO ANÁLISE E APROVAÇÃO DO CLAUDE`

Worktree: `codex-fati-4-6`
Branch: `codex/fatia-4-6`
Commit, merge e push: não realizados.

## Pedido ao Claude

Revisar o código e a documentação desta worktree e emitir um veredito:

- `APROVADO`;
- `APROVADO COM PENDÊNCIAS`; ou
- `REPROVADO`.

A revisão deve verificar escopo, modelagem, migration, integridade dos dados,
testes, segurança, regressões e a prevenção dos problemas recorrentes de
bootstrap entre worktrees. A análise não deve alterar arquivos, executar Git
destrutivo, acessar segredos ou autorizar commit/push por conta própria.

## Escopo implementado

### Fatia 4.6

- Adicionados ao modelo `Article` os campos opcionais de imagem de capa:
  `coverImageUrl`, `coverImageKey`, `coverImageMime`, `coverImageSize` e
  `coverImageAlt`.
- A leitura pública seleciona os metadados aprovados da capa.
- A publicação de artigo rejeita ausência de URL ou texto alternativo.
- A migration adiciona as colunas e uma restrição que impede artigo publicado
  sem `cover_image_url` e `cover_image_alt`.
- Testes unitários cobrem seleção pública, rejeição e publicação válida.
- Teste de integração cobre o contrato da Fatia 4.6 no banco local.

### Prevenção operacional entre worktrees

- `scripts/bootstrap-local-db.ps1` deriva um nome de projeto Compose próprio da
  worktree, evitando reutilização acidental de volume PostgreSQL de outra
  worktree.
- O bootstrap aplica migrations e executa o seed oficial explicitamente com
  `npx tsx prisma/seed.ts`.
- `docker-compose.yaml` e `scripts/seed-preview-admin.ps1` usam o mesmo caminho
  explícito de seed, pois `prisma db seed` não inseriu as categorias neste stack
  durante a reprodução do problema.
- A documentação de bootstrap e regras aponta para o fluxo local completo.
- O bootstrap continua bloqueando worktrees com arquivos obrigatórios ausentes
  ou inválidos, incluindo o caso de `next-env.d.ts` como diretório.

## Evidências de validação

- Migrations aplicadas com sucesso no projeto Compose isolado da worktree,
  incluindo `20260907091500_fatia_4_6_article_cover_image`.
- Seed oficial confirmado com as seis categorias base:
  `fumicultura`, `equipamentos`, `aviario`, `piscicultura`, `secadores` e
  `acessorios`.
- `test:db`: `6` arquivos e `44/44` testes aprovados.
- `git diff --check`: aprovado; há apenas aviso de normalização CRLF em
  `.gitignore`.
- `next-env.d.ts` foi restaurado como arquivo canônico após a reprodução do
  artefato incorreto como diretório.
- Nenhum segredo foi incluído no handoff ou nas alterações documentadas.

## Pontos que exigem confirmação do Claude

1. A migration é segura para dados existentes e a constraint de artigos
   publicados corresponde à regra de negócio aprovada.
2. A combinação de campos opcionais no schema com validação na publicação não
   permite estados inválidos por outros caminhos de escrita.
3. A seleção pública não expõe dados internos desnecessários, especialmente
   `coverImageKey`, MIME e tamanho.
4. O uso de `tsx prisma/seed.ts` é reproduzível no container e não cria efeitos
   destrutivos ou duplicação quando executado novamente.
5. O isolamento do nome do projeto Compose é suficiente para evitar colisão
   entre worktrees e não interfere no ambiente Preview/Supabase configurado pelo
   usuário.
6. Os testes cobrem os critérios da Fatia 4.6 e não mascaram falhas de
   configuração ou de banco vazio.
7. As mudanças de bootstrap, seed e documentação permanecem dentro do escopo
   de prevenção operacional e não introduzem arquitetura não aprovada.

## Arquivos principais para revisão

- `prisma/schema.prisma`
- `prisma/migrations/20260907091500_fatia_4_6_article_cover_image/migration.sql`
- `src/lib/content/article-repository.ts`
- `src/lib/content/article-repository.test.ts`
- `src/lib/db/__tests__/fatia-4-6.integration.test.ts`
- `scripts/bootstrap-local-db.ps1`
- `docker-compose.yaml`
- `scripts/seed-preview-admin.ps1`
- `docs/WORKTREE_PREVIEW.md`
- `docs/RULES.md`

## Pendências e limites

- A aprovação de Jose e do Claude ainda é necessária antes de qualquer commit,
  merge ou push.
- Não foi feita validação de produção, Vercel ou Supabase neste handoff.
- Segredos e arquivos `.env` não fazem parte da revisão nem devem ser abertos.
- Qualquer ampliação para storage externo, upload, CRUD ou nova regra de negócio
  exige proposta e aprovação separadas.

## Formato esperado do parecer

### Resumo executivo
### Pontos fortes
### Riscos encontrados
### Mudanças obrigatórias
### Melhorias recomendadas
### Pendências para Jose
### Veredito final

O veredito deve distinguir falhas bloqueadoras de melhorias não bloqueadoras e
deixar explícito se a entrega pode seguir para os testes manuais de Jose.
