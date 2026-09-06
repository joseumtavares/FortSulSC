# FortSul

Reformulação do site institucional da FortSul Equipamentos Agrícolas. A base atual inclui frontend estático; a fase e o escopo autorizados devem ser confirmados no Plano Mestre antes de qualquer mudança.

## Fonte de verdade

Consulte primeiro [docs/PLANO_MESTRE_FORTSULSC.md](docs/PLANO_MESTRE_FORTSULSC.md). Ele define a fase vigente, as regras de governança e os portões de aprovação.

## Executar localmente

Pré-requisito: Node.js 20.9 ou superior.

```powershell
npm run dev
```

Abra `http://127.0.0.1:3000`.

## Ambiente Docker local

Pré-requisitos: Docker Desktop em execução, integração WSL habilitada quando
aplicável e Docker Compose v2.

Crie o arquivo local de variáveis e preencha uma senha de desenvolvimento para
o PostgreSQL. O arquivo `.env` não deve ser versionado.

```powershell
Copy-Item .env.example .env
```

Depois de preencher `POSTGRES_PASSWORD` no `.env`, valide e suba os serviços:

```powershell
docker compose config --quiet
docker compose up --build -d
docker compose ps
curl.exe -fsS http://127.0.0.1:3000/
```

O PostgreSQL fica acessível somente à rede interna do Compose. Nesta fase a
aplicação ainda não se conecta ao banco; a saúde de cada serviço é validada de
forma independente. Para verificar o banco:

```powershell
docker compose exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Para encerrar preservando os dados locais:

```powershell
docker compose down
```

Use `docker compose down -v` somente quando quiser apagar também o volume local
do PostgreSQL.

## Testar

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run typecheck` gera o Prisma Client antes da checagem TypeScript. Os testes
de integração Prisma também exigem `DATABASE_URL` no `.env` local da worktree;
esse arquivo não deve ser versionado nem copiado de outro ambiente.

Para preparar uma worktree nova e testar o fluxo completo com Preview Vercel,
use os scripts descritos em [docs/WORKTREE_PREVIEW.md](docs/WORKTREE_PREVIEW.md).

O smoke test valida as rotas públicas principais, a resposta 404 e o bloqueio de tentativas de path traversal no servidor local.

## Escopo atual

- Home responsiva, menu móvel, filtros visuais e diálogo de contato via WhatsApp.
- Página estática do Alimentador de Cavaco, Briquete e Pellets.
- Página 404, `robots.txt`, metadados e mídias locais.
- Sem integração de formulário, autenticação, painel administrativo ou API de
  negócio aprovada. A fundação Prisma/PostgreSQL (schema, migrations e testes
  de integração) já existe e só pode avançar nas fatias autorizadas.

## Documentação

- [Plano Mestre](docs/PLANO_MESTRE_FORTSULSC.md) — fonte de verdade para governança e fase atual.
- [Checklist](docs/CHECKLIST.md) — cobertura e validações pendentes.
- [Design System](docs/DESIGN-SYSTEM.md) — tokens e regras visuais.
- [Componentes](docs/COMPONENTS.md) — blocos visuais atuais e mapeamento futuro.
- [Regras](docs/RULES.md) — limites técnicos e de segurança.
- [Contrato operacional de agentes](docs/FortSulSC_instrucoes_Hermes_Codex.md) — papéis, limites, delegação e processo obrigatório para agentes e subagentes.
- [Prompt de comunicação para agentes](docs/PROMPT_COMUNICACAO_AGENTES.md) — handoff consolidado do estado, decisões e regras atuais.
