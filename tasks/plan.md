# Plano de implementação: Fase 2 — Fundação Next.js

## Visão geral

Migrar progressivamente o frontend estático aprovado para uma base Next.js com
TypeScript e App Router, preservando a aparência, as rotas públicas já
existentes e os arquivos estáticos até que a equivalência seja verificada.
Esta etapa não cria backend, banco de dados, autenticação, painel, API, Docker
ou regras de negócio.

## Decisões de arquitetura

- Usar App Router em `src/app`; o layout raiz conterá `html`, `body` e a
  importação de CSS global, conforme a documentação atual do Next.js.
- Manter configurações e `public/` na raiz; os assets usados pelo frontend
  migrado serão servidos a partir de `public/`, sem apagar os arquivos estáticos
  enquanto a equivalência não estiver aprovada.
- Migrar em fatias verticais: base executável, home, página de produto e 404.
  Cada fatia precisa preservar o comportamento público existente antes de a
  próxima começar.
- Não criar rotas de revendas, admin, API ou integrações nesta fundação. Elas
  dependem de decisões de produto e/ou fases posteriores.

## Escopo excluído

- PostgreSQL, Prisma, migrations ou qualquer schema;
- Auth.js, RBAC, login ou painel administrativo;
- Route Handlers, Server Actions e `src/app/api` funcional;
- Docker e Docker Compose;
- dados dinâmicos, CMS, formulários e mapas interativos.

## Lista de tarefas

### Checkpoint: Savepoint pré-fundação

- [ ] Todo o trabalho aprovado até aqui (seção "Novidades e dicas" e as
  atualizações de governança e planejamento) está commitado e isolado de
  qualquer alteração de fundação Next.js.
- [ ] Working tree limpo, exceto pelos itens intencionalmente não rastreados
  `.agents/` e `skills-lock.json`.
- [ ] `git status --short` apresentado como evidência antes de iniciar a
  Tarefa 1A.

### Fase 1: Base executável

- [ ] **Tarefa 1A — Configurar a fundação Next.js e TypeScript.**
  - Critérios: `package.json`, `tsconfig.json`, `next.config.*` e os scripts de
    desenvolvimento, build e typecheck estão definidos com as dependências
    indispensáveis; o preview estático atual continua inalterado e executável.
  - Dependências: aprovação deste plano, revisão técnica do Claude e savepoint
    Git criado para o estado aprovado anterior.
  - Escopo: pequeno.

- [ ] **Tarefa 1B — Criar a estrutura mínima do App Router.**
  - Critérios: `src/app/layout.tsx`, `src/app/page.tsx` e CSS global existem;
    `npm run dev`, build e verificação de tipos funcionam.
  - Dependências: Tarefa 1A aprovada.
  - Escopo: pequeno.

- [ ] **Tarefa 2 — Disponibilizar assets sem remover o baseline estático.**
  - Critérios: assets do frontend migrado são resolvidos por Next.js em
    `public/`; nenhum asset existente é apagado; as imagens mantêm dimensões e
    textos alternativos aprovados.
  - Dependências: Tarefa 1B.
  - Escopo: pequeno.

### Checkpoint: Fundação

- [ ] `npm run dev`, build e typecheck passam.
- [ ] A página raiz do Next.js responde sem erros de console.
- [ ] Revisão técnica do Claude aprova a fundação antes da migração visual.

### Fase 2: Migração vertical do site público

- [ ] **Tarefa 3 — Migrar a home como componentes visuais.**
  - Critérios: layout, navegação mobile, filtros visuais, diálogo de WhatsApp,
    seção Novidades e dicas e responsividade preservam o comportamento do
    frontend estático aprovado.
  - Dependências: checkpoint Fundação.
  - Escopo: grande; executar exclusivamente pelos Incrementos 2–8 já
    formalizados e aprovados, sem replanejar seus limites. Isso inclui
    SiteHeader/Footer; Hero/Categorias/Sobre; Soluções e filtros; Atendimento,
    Presença e CTA; e WhatsAppDialog. O Incremento 5 deve usar o contrato de
    teste revisado com as cinco categorias oficiais antes do ciclo RED–GREEN.

- [ ] **Tarefa 4 — Migrar a página estática de produto e a página 404.**
  - Critérios: rotas públicas equivalentes, metadados e CTAs continuam
    funcionais; não há dependência de dados dinâmicos.
  - Dependências: Tarefa 3 e decisão explícita de slug/rota pública do produto.
  - Escopo: médio.

### Checkpoint: Equivalência pública

- [ ] Home, produto e 404 validados em navegador nas larguras relevantes.
- [ ] Testes automatizados, build, typecheck e verificações de acessibilidade
  aplicáveis passam.
- [ ] José e Claude aprovam a equivalência antes de remover ou redirecionar o
  frontend estático.

## Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Regressão visual durante a migração | Alto | Comparar cada fatia com o baseline e validar no navegador antes de avançar. |
| Decisões pendentes contaminarem a fundação | Médio | Não criar rotas ou dados dependentes de revendas, CMS, auth ou banco. |
| Remover o estático cedo demais | Alto | Manter o baseline até a aprovação de equivalência pública. |
| Dependências desnecessárias | Médio | Instalar apenas Next.js, React, React DOM e TypeScript/tooling indispensável à fundação. |

## Perguntas abertas

- A rota pública de revendas seguirá para a Fase 2 ou ficará fora do primeiro
  corte? A fundação não a criará até essa decisão ser consolidada.
- Qual slug e formato de rota pública serão aprovados para a página de produto?
  A Tarefa 4 não começará sem essa decisão.
- O pacote estático aprovado deve permanecer disponível como fallback local até
  a equivalência da home, produto e 404, conforme proposto?
