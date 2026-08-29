# PLANO MESTRE DE CONTROLE — PROJETO FORTSULSC

> Documento de contexto, governança técnica e execução por fases para qualquer agente (Claude, Codex ou outro) que trabalhar neste projeto.
>
> **Projeto:** FortSulSC — reformulação do site institucional/catálogo da FortSul Equipamentos Agrícolas
> **Stack esperada (fase full stack futura):** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma, Auth.js, Leaflet + OpenStreetMap
> **Estado atual do código:** frontend estático (`index.html`, `styles.css`, `script.js`), sem backend, sem banco, sem autenticação
> **Abordagem:** modernização incremental de um site já existente, protótipo visual já aprovado pelo cliente, com implementação por portões de aprovação — design/frontend primeiro, backend somente após aprovação explícita do Jose
> **Data de consolidação:** 21 de agosto de 2026
> **Repositório:** https://github.com/joseumtavares/FortSulSC (público)

> **Atualização vigente:** este documento substitui o controle informal que estava espalhado entre `PLANEJAMENTO_PROJETO.md`, `ARCHITECTURE.md`, `API.md`, `COMPONENTS.md`, `DESIGN-SYSTEM.md`, `RULES.md` e `CHECKLIST.md`. Esses arquivos continuam sendo a fonte de detalhe técnico de cada assunto; este Plano Mestre é a fonte de verdade sobre **em que fase o projeto está agora** e **o que pode ser feito em seguida**.

---

## 0. Finalidade deste documento

Este documento reúne:

1. o estado atual real do projeto, confirmado a partir do repositório;
2. os marcadores de status por etapa, para qualquer agente saber onde retomar;
3. o roadmap completo de fases, da Fase 0 à Fase 6;
4. as regras de segurança e escopo que nenhum agente pode violar, mesmo sob pedido;
5. o protocolo de leitura obrigatória antes de qualquer ação;
6. o registro de decisões já aprovadas e das decisões ainda pendentes do Jose;
7. um item de segurança em aberto que precisa de ação antes de qualquer nova tarefa.

Qualquer agente deverá conhecer todo o documento, mas **não deverá implementar todas as fases de uma vez**.

A Fase 1 foi formalmente encerrada e seu baseline aprovado foi registrado no commit `88e7d6f`. A execução da **Fase 2 — Estrutura Next.js** está autorizada; o plano técnico revisado aguarda as sete decisões pendentes registradas no planejamento vigente antes dos incrementos que dependam delas.

Ao final de qualquer etapa, o agente deve atualizar o marcador correspondente neste documento e parar para revisão do Jose antes de avançar de fase.

---

## 0.1. Marcadores de status do Plano Mestre

| Marcador | Estado | Uso |
|---|---|---|
| 🔴 | Não implementado | Etapa ainda não iniciada ou ainda não autorizada. |
| 🟡 | Implementação parcial | Etapa iniciada, mas com pendências, bloqueios ou validações obrigatórias em aberto. |
| 🟢 | Implementação concluída | Etapa concluída, validada e registrada. |
| 🛑 | Bloqueado | Etapa não pode avançar até um risco ou pendência externa ser resolvido. |

---

## 0.2. Roadmap de execução atual

Status consolidado em 25 de agosto de 2026:

| Status | Etapa | Situação atual | Próximo portão |
|---|---|---|---|
| 🟢 | Item de segurança — arquivo `recovery-codes-vercel-fortsul.txt` | Confirmado via GitHub: o repositório publicado (`joseumtavares/FortSulSC`) tem histórico com **1 commit único**, sem o arquivo. Como não existe commit anterior à remoção, não há histórico de Git para purgar — o risco de exposição pelo repositório está encerrado. | Falta só confirmar se os códigos de recuperação foram revogados/regenerados na Vercel como precaução (o arquivo pode ter circulado fora do Git antes da remoção). Isso é uma confirmação operacional do Jose, não bloqueia mais o desenvolvimento. |
| 🟢 | Fase 0 — Planejamento e validação | `PLANEJAMENTO_PROJETO.md`, `ARCHITECTURE.md`, `API.md`, `COMPONENTS.md`, `DESIGN-SYSTEM.md`, `RULES.md` e `CHECKLIST.md` criados e revisados. Revisão técnica externa realizada. Repositório publicado no GitHub (`joseumtavares/FortSulSC`), commit inicial aprovado pelo Jose. | Nenhum; etapa concluída, mantida como referência viva. |
| 🟢 | Fase 1 — Design/frontend | Formalmente encerrada; baseline aprovado no commit `88e7d6f`. | Nenhum; preservada como baseline e referência de rollback. |
| 🟡 | Fase 2 — Estrutura Next.js | Tarefas 1A e 1B concluídas (`57a414f`, `160eb38`) e Tarefa 2 — assets em `public/` — concluída (`7883435`). Tarefa 3 (migração visual da home) em andamento: Fatias 3.1 a 3.5 commitadas (`3fc687c` … `b877e0e`), cobrindo Header/Footer, Hero, CategoryStrip, About/Solutions e Atendimento (SupportSection). Correção de responsividade do CategoryStrip commitada (`011cdbb`) e correção de referência de imagem do mapa de representantes commitada (`f78da05`). | Fatia 3.6 (Presença — `PresenceSection`) com proposta técnica registrada, aguardando aprovação do Jose e revisão técnica antes da implementação. As sete decisões pendentes do planejamento vigente continuam bloqueando os incrementos que dependam delas. |
| 🔴 | Fase Docker — Fundação de conteinerização | Não iniciada. Ainda não há Dockerfile, `docker-compose.yaml` nem `.env.example` no repositório. | Aprovação da Fase 2. Deve rodar antes da Fase 3, para que a modelagem de banco já nasça testável em ambiente isolado (Postgres em container), seguindo o mesmo cuidado usado no projeto Nonna. |
| 🔴 | Fase 3 — Modelagem e regras de negócio | Não iniciada. Entidades prováveis já listadas em `PLANEJAMENTO_PROJETO.md` (Product, Category, Representative, RepresentativePrivate, Reseller, Region, Banner, AdminUser, AuditLog) como hipótese, não como contrato. | **Só pode começar após consulta e aprovação explícita do Jose** — inclui aprovar regras de negócio, modelagem de banco e política de consentimento de dados de representantes. |
| 🔴 | Fase 4 — Painel administrativo | Não iniciada. | Conclusão e aprovação da Fase 3. |
| 🔴 | Fase 5 — Mapa e dados públicos | Não iniciada. Componente `RepresentativeMap` já documentado em `COMPONENTS.md` como planejado. | Conclusão e aprovação da Fase 4, e definição prévia de quais dados de representantes são públicos. |
| 🔴 | Fase 6 — Segurança, testes e deploy | Não iniciada. | Conclusão e aprovação da Fase 5. |

---

# PARTE I — PROTOCOLO DE TRABALHO DO AGENTE

## 1. Leitura obrigatória antes de qualquer ação

Antes de propor ou executar qualquer modificação, o agente deve:

1. ler integralmente este Plano Mestre;
2. ler `docs/PLANEJAMENTO_PROJETO.md` para entender contexto e roadmap detalhado;
3. ler `docs/RULES.md` e `docs/CHECKLIST.md` antes de qualquer entrega;
4. ler `docs/DESIGN-SYSTEM.md` antes de qualquer alteração visual;
5. ler `docs/ARCHITECTURE.md` e `docs/API.md` antes de qualquer alteração estrutural, mesmo que só de organização de pastas;
6. ler `docs/COMPONENTS.md` antes de criar ou renomear um componente;
7. verificar o estado real do repositório (não presumir que os documentos estão 100% sincronizados com o código);
8. verificar se o item de segurança 🛑 (arquivo de recovery codes) já foi resolvido antes de qualquer commit.
9. consultar o SecondBrain e usar os skills aplicáveis de `addyosmani/agent-skills`, começando por `using-agent-skills`;
10. consultar Context7 para a documentação atual de bibliotecas, frameworks, SDKs, APIs, CLIs ou serviços envolvidos.

Caso exista divergência entre este documento, os docs de detalhe e o código real:

- não escolher silenciosamente um dos lados;
- registrar a divergência nesta seção de roadmap;
- informar o impacto ao Jose;
- propor a decisão técnica;
- aguardar aprovação quando a decisão puder mudar escopo, dados ou contrato visual já aprovado.

---

## 2. Regras de segurança e escopo

O agente não deve, em nenhuma fase, mesmo sob pedido direto:

- criar backend, banco de dados, autenticação, CRUD administrativo ou regras de negócio sem aprovação explícita do Jose;
- criar ou alterar schema Prisma antes da Fase 3 ser aprovada;
- expor dados privados de representantes ou revendas (endereço, documento, telefone pessoal, coordenadas exatas de residência);
- publicar localização de pessoa física sem ser aproximada e sem consentimento registrado;
- usar prefixo `NEXT_PUBLIC_` para qualquer segredo ou credencial;
- salvar segredos, tokens, senhas ou recovery codes no repositório;
- fazer commit ou push sem autorização explícita — o Jose conduz o fluxo Git;
- alterar drasticamente o padrão visual aprovado no protótipo sem apresentar a mudança antes;
- adicionar dependência pesada sem justificar a necessidade real;
- transformar qualquer documento de planejamento em contrato implementado sem validação;
- iniciar a Fase 2 (estrutura Next.js) sem a Fase 1 estar revisada e aprovada;
- iniciar a Fase 3 (modelagem/regras de negócio) sem passar antes pela lista de perguntas da seção 6 deste documento.

Em caso de dúvida, preferir sempre:

1. leitura;
2. diagnóstico;
3. plano;
4. apresentação da proposta;
5. aprovação;
6. implementação pequena e reversível;
7. revisão;
8. atualização deste Plano Mestre.

---

## 3. Uso de Git

Antes de qualquer alteração:

```bash
git status --short --branch
git log --oneline --decorate -10
git diff
git ls-files --others --exclude-standard
```

O agente deve:

- informar a branch atual;
- registrar alterações preexistentes antes de mexer em qualquer arquivo;
- não sobrescrever trabalho já feito;
- mostrar o diff proposto antes de aplicar;
- não fazer commit automaticamente — commits e push são conduzidos pelo Jose;
- **antes de qualquer commit, confirmar que `recovery-codes-vercel-fortsul.txt` (ou qualquer outro segredo) não está staged.**

---

## 4. Fluxo obrigatório de aprovação em duas camadas (José + Claude)

Este é o mesmo protocolo usado no projeto Nonna e passa a valer também para o FortSulSC, para qualquer entrega que envolva modelagem, regra de negócio, endpoint, schema ou qualquer decisão estrutural — não apenas para backend.

Nenhuma implementação real começa antes de passar por todas as etapas abaixo, nesta ordem:

1. **Modelagem/proposta.** O agente que implementa (ex.: Codex) apresenta a proposta técnica completa antes de escrever qualquer código de produção — entidades, contratos de componente, schema, endpoints ou regras, conforme o caso. Nenhum código de produção é escrito nesta etapa.
2. **Análise e aprovação do Jose.** O Jose analisa a proposta e aprova, pede ajuste ou rejeita. Sem essa aprovação, a proposta não avança.
3. **Revisão do Claude.** Toda proposta aprovada pelo Jose é enviada para o Claude revisar tecnicamente antes da implementação — mesmo que o Codex (ou outro agente) seja quem vá implementar.
4. **Implementação + testes smoke.** Só depois da aprovação do Claude o agente implementa o código e os testes automatizados (smoke tests) correspondentes.
5. **Lista de testes manuais para o Jose.** O agente que implementou entrega uma lista objetiva do que o Jose deve testar manualmente — para o FortSulSC, isso normalmente significa testes no navegador (responsividade, fluxo de CTA/WhatsApp, formulários, mapa, etc.), e não em Postman/curl como no Nonna, salvo quando houver API sendo testada diretamente.
6. **Aprovação dupla antes do commit.** O commit e o push só podem ser feitos depois de o Jose **e** o Claude aprovarem o resultado. Nenhum agente deve fazer commit sozinho com base apenas na própria avaliação.

Regra equivalente à DEC-020 do projeto Nonna, também válida aqui: ao propor modelagem de qualquer funcionalidade nova que envolva regra de negócio (isso vale a partir da Fase 3), o contrato deve vir com **código de teste completo** (não descrição em prosa da cobertura esperada) já na etapa 1, antes de qualquer Model, Service, Controller, Server Action ou Route Handler ser escrito. Na Fase 1/2 (design/frontend puro, sem regra de negócio), este requisito de teste em código não se aplica — mas os demais passos do fluxo (1 a 6) continuam valendo.

---

## 5. Forma esperada de resposta ao propor uma nova etapa

Ao propor avanço de fase, o agente deve organizar a resposta nesta ordem:

1. resumo do que já existe hoje (estado real, não o planejado);
2. o que está sendo proposto nesta etapa;
3. o que **não** será feito nesta etapa e por quê;
4. riscos identificados (produto, UX, segurança, manutenção);
5. perguntas/decisões que dependem do Jose antes de prosseguir;
6. proposta de diff ou entregável concreto;
7. atualização sugerida da tabela da seção 0.2.

Não implementar a próxima fase antes de o Jose confirmar a fase atual como concluída, e não pular nenhuma etapa do fluxo de aprovação descrito na seção 4.

---

# PARTE II — DECISÕES JÁ APROVADAS

| Decisão | Estado |
|---|---|
| Manter o padrão visual aprovado no protótipo, com modernizações leves apresentadas antes | Aprovada |
| Stack full stack: Next.js + TypeScript + PostgreSQL + Prisma + Tailwind + shadcn/ui + Leaflet/OSM | Aprovada como direção, não implementada |
| Frontend antes de backend | Aprovada |
| Backend/banco/regras de negócio só após aprovação explícita do Jose | Obrigatória |
| Separação entre dados públicos e privados de representantes (`representatives` vs `representative_private`) | Aprovada como modelo de referência, não implementada |
| Nenhum commit/push automático sem autorização do Jose | Aprovada |
| WhatsApp como canal principal de conversão nesta fase | Aprovada |
| Containerização do projeto com Docker | Aprovada como direção, não implementada — ver Fase Docker na Parte IV |
| Fluxo de aprovação em duas camadas (Jose + revisão do Claude) obrigatório antes de qualquer implementação e antes de qualquer commit | Obrigatória |
| Contrato de testes em código antes de implementar regra de negócio nova, a partir da Fase 3 (equivalente à DEC-020 do projeto Nonna) | Obrigatória |

---

# PARTE III — DECISÕES PENDENTES DO JOSE

Estas decisões **bloqueiam** a conclusão da fase indicada e devem ser resolvidas antes de avançar:

| Pergunta | Bloqueia o quê |
|---|---|
| Representantes/revendas já deram consentimento para nome, WhatsApp e localização aproximada publicados? | Fase 3 e Fase 5 (mapa) |
| Revendas terão página pública própria ou o item sai do roadmap por ora? | Fase 1 (estrutura de páginas) e Fase 2 (rotas) |
| Blog será mantido, virará "Conteúdos técnicos" ou sai do menu? | Fase 1 (menu final) |
| Orçamento continua só via WhatsApp ou também por formulário? | Fase 3 (define se há entidade de contato/lead) |
| Quantos perfis de usuário o admin terá (Admin, Editor, Comercial, Visualizador)? | Fase 3 e Fase 4 |
| Qual storage de imagens será usado (Cloudinary, R2, S3)? | Fase 3 |
| Painel administrativo é prioridade da v1 ou pode ficar para depois do lançamento comercial? | Ordem entre Fase 4 e o lançamento público |
| Existe política de privacidade publicada ou precisa ser redigida? | Fase 1 (link no rodapé) e Fase 3 (LGPD) |
| Os recovery codes expostos no repositório ainda são válidos? | Bloqueia qualquer commit/push imediatamente |

---

# PARTE IV — ROADMAP DETALHADO POR FASE

## Fase 0 — Planejamento e validação 🟢

Objetivo: consolidar escopo, mapear o site atual, documentar o que será mantido/removido/melhorado.

Entregáveis: os sete documentos em `docs/`, este Plano Mestre, e a revisão técnica externa já realizada.

## Fase 1 — Design/frontend 🟢

Objetivo: transformar o protótipo aprovado em frontend moderno e responsivo, sem banco, sem autenticação, sem CRUD.

Já existe localmente:
- home, categorias, seção institucional, suporte, representantes (lista), rodapé, menu mobile, CTA WhatsApp fixo;
- página de produto para o alimentador, com breadcrumbs, galeria, aplicações, especificações e CTA;
- página 404, `robots.txt` e meta descriptions nas páginas estáticas;
- smoke test local do servidor para rotas públicas, 404 e tentativas de traversal.

Fase encerrada formalmente com o baseline `88e7d6f`. Resultados de Lighthouse e validações do frontend estático permanecem como evidência histórica do baseline; qualquer nova medição deve identificar ambiente, data e commit avaliado.

Não incluir nesta fase: banco, autenticação, CRUD, regras de negócio, mapa interativo com dados dinâmicos.

## Fase 2 — Estrutura Next.js 🟡

Objetivo: migrar o frontend aprovado para base Next.js + TypeScript, seguindo a estrutura de pastas de `ARCHITECTURE.md`. A fase está autorizada, com plano técnico revisado e aprovado; os incrementos que dependam das sete decisões pendentes devem aguardar sua consolidação.

Importante: a pasta `app/api/` nasce vazia/placeholder nesta fase — não implica API funcional. Rotas de "Revendas" só devem ser criadas se a Parte III já tiver sido respondida.

Pendência aberta: a seção “Novidades e dicas” utiliza conteúdo de teste
aprovado exclusivamente para validação de layout. Os três cards devem ser
substituídos por conteúdo de lançamento antes da publicação da seção.

## Fase Docker — Fundação de conteinerização 🔴

Objetivo: rodar o projeto em container antes de a modelagem de banco (Fase 3) começar, para que schema e migrations já nasçam testáveis em ambiente isolado — mesmo cuidado adotado no projeto Nonna com a "Fase Docker 0".

Entregáveis esperados:
- `Dockerfile` para a aplicação Next.js;
- `docker-compose.yaml` com serviço da aplicação e serviço PostgreSQL para desenvolvimento local;
- `.env.example` na raiz, sem valores reais;
- documentação de como subir o ambiente localmente (`docker compose up`);
- confirmação de que a aplicação sobe e responde dentro do container antes de qualquer migration ser criada.

Segue o mesmo fluxo de aprovação da seção 4 do Plano Mestre: proposta da estrutura de containers → aprovação do Jose → revisão do Claude → implementação → testes smoke → lista de verificação manual para o Jose → aprovação dupla → commit.

Não incluir nesta fase: schema Prisma, migrations, dados reais, credenciais de produção dentro do container ou do `docker-compose.yaml`.

## Fase 3 — Modelagem e regras de negócio 🔴

Objetivo: definir banco, entidades, permissões e regras de negócio.

**Esta fase só começa depois de consulta e aprovação do Jose**, e depois de todas as perguntas da Parte III estarem respondidas — em especial consentimento de dados de representantes e política de retenção/exclusão (LGPD).

Entregável esperado ao final: modelagem completa apresentada (entidades, modelo relacional, diagrama, plano de migrations) **sem criar nenhuma tabela ainda**, aguardando autorização expressa — mesmo protocolo usado no projeto Nonna.

A partir desta fase, toda proposta de regra de negócio deve seguir o fluxo completo da seção 4 e vir acompanhada do contrato de testes em código (não em prosa), antes de qualquer Model, Service, Route Handler ou Server Action ser escrito.

## Fase 4 — Painel administrativo 🔴

Objetivo: dashboard interno para produtos, categorias, representantes, revendas, regiões, banners e configurações.

Depende de: Fase 3 aprovada e resposta à pergunta "painel é prioridade da v1?" na Parte III.

## Fase 5 — Mapa e dados públicos 🔴

Objetivo: implementar `RepresentativeMap` com Leaflet + OpenStreetMap.

Pré-condição obrigatória: consentimento de representantes confirmado (Parte III) e regra de dados públicos vs privados já implementada e testada na Fase 3/4.

## Fase 6 — Segurança, testes e deploy 🔴

Objetivo: endurecer a aplicação para produção — validação de dados, RBAC, rate limiting, logs seguros, backups, deploy, revisão final.

Deve incluir explicitamente: rate limiting/anti-scraping nas rotas públicas de representantes, e confirmação de que o incidente do arquivo `recovery-codes-vercel-fortsul.txt` foi encerrado.

## Backlog de funcionalidades futuras (fora da sequência de fases)

Funcionalidades avaliadas tecnicamente e conscientemente adiadas — não bloqueiam nem alteram o roadmap acima — ficam registradas em `docs/BACKLOG_FUNCIONALIDADES_FUTURAS.md`, com especificação suficiente para implementação futura sem repetir a análise.

Item atual: **Scroll-Pinned Product Showcase — Bioqueimador de Cavaco** (avaliado em 27/08/2026; recomendação foi adiar para depois da aprovação do catálogo na Fase 3, idealmente já com o bundler da Fase 2 disponível).

---

# PARTE V — DEFINIÇÃO DE PRONTO DESTE DOCUMENTO

Um agente entendeu este Plano Mestre quando consegue:

- explicar por que o projeto começa pelo frontend e não pelo banco, neste caso específico;
- identificar no roadmap a fase autorizada e suas dependências, sem assumir que instruções históricas continuam vigentes;
- citar o item de segurança do recovery codes e seu status atual (histórico publicado sem o arquivo; confirmação de revogação na Vercel ainda depende do Jose) antes de qualquer commit;
- listar as perguntas pendentes do Jose que bloqueiam a Fase 3;
- diferenciar o que já existe (frontend estático) do que é apenas planejado (Next.js, Prisma, painel admin, Docker);
- não iniciar a Fase Docker antes do portão correspondente da Fase 2, nem a Fase 3 sem aprovação explícita e suas dependências;
- explicar as seis etapas do fluxo de aprovação da seção 4 (modelagem → aprovação do Jose → revisão do Claude → implementação/testes smoke → lista de testes manuais → aprovação dupla → commit) e nunca pular etapa;
- reconhecer que, a partir da Fase 3, toda regra de negócio nova exige contrato de testes em código antes da implementação;
- atualizar a tabela da seção 0.2 sempre que uma etapa mudar de estado.

---

# PARTE VI — REGISTRO DE ATUALIZAÇÕES DESTE PLANO

| Data | Atualização |
|---|---|
| 21/08/2026 | Criação do Plano Mestre, a partir da revisão técnica dos sete documentos existentes e da identificação do item de segurança do arquivo de recovery codes. |
| 21/08/2026 | Jose removeu `recovery-codes-vercel-fortsul.txt` do repositório. Item rebaixado de 🛑 para 🟡 até confirmar purga de histórico e revogação na Vercel. Instrução de início da próxima etapa (conclusão da Fase 1) adicionada na Parte VII. |
| 21/08/2026 | Incorporado o fluxo de aprovação em duas camadas (Jose + revisão do Claude) do projeto Nonna, adaptado ao contexto do FortSulSC (nova seção 4 da Parte I). Adicionada a Fase Docker ao roadmap, entre a Fase 2 e a Fase 3, e registrada como decisão aprovada a exigência de contrato de testes em código antes de implementar regra de negócio nova (equivalente à DEC-020 do Nonna). |
| 21/08/2026 | Commit inicial aprovado pelo Jose e repositório publicado em https://github.com/joseumtavares/FortSulSC (público). Confirmado via GitHub que o histórico tem 1 commit único, sem `recovery-codes-vercel-fortsul.txt` — item de segurança rebaixado de 🟡 para 🟢, restando apenas a confirmação operacional de revogação dos códigos na Vercel. Nota de processo: este commit inicial foi aprovado só pelo Jose, sem registro de revisão do Claude — aceitável como commit de bootstrap do repositório (nenhuma regra de negócio ou dado sensível envolvido), mas o fluxo de aprovação em duas camadas da seção 4 passa a valer de forma estrita a partir do próximo commit. |
| 25/08/2026 | Fase 1 formalmente encerrada e baseline aprovado no commit `88e7d6f`. Fase 2 autorizada; plano técnico revisado e aprovado, com sete decisões pendentes a consolidar antes dos incrementos dependentes. |
| 27/08/2026 | José aprovou o incremento estático “Novidades e dicas” após revisão técnica do Claude. A pendência de substituir o conteúdo de teste antes da publicação permanece aberta; a aprovação não altera os status de Fase 1 ou Fase 2. Iniciado o planejamento do primeiro incremento da Fase 2, limitado à fundação Next.js sem banco, API, autenticação, painel ou rotas condicionadas a decisões pendentes. |
| 27/08/2026 | Avaliada a proposta de animação de scroll (pinning) do "Bioqueimador de Cavaco". Recomendação técnica: adiar, pois o produto não existe no catálogo atual (escopo da Fase 3, não autorizada) e o frontend estático não tem bundler/dependências JS externas. Especificação completa registrada em `docs/BACKLOG_FUNCIONALIDADES_FUTURAS.md` e referenciada na Parte IV, seção "Backlog de funcionalidades futuras". Nenhum código foi alterado. |
| 27/08/2026 | Tarefas 1A e 1B da Fase 2 concluídas e commitadas (`57a414f`, `160eb38`): fundação Next.js/TypeScript e estrutura mínima do App Router. Decisão registrada: `next.config.ts` define `agentRules: false` para impedir que o Next.js injete automaticamente um bloco de instruções em `CLAUDE.md` quando `next dev` detectar um agente de IA, preservando-o como fonte de governança deliberada. Próximo passo: Tarefa 2 (assets em `public/`). |
| 29/08/2026 | Correção de defasagem entre este Plano Mestre e o estado real do Git (a `main` local estava 17 commits à frente de `origin/main`, sem push). Tarefa 2 (`7883435`) e Fatias 3.1 a 3.5 da Tarefa 3 (`3fc687c` … `b877e0e`) passam a constar como concluídas na tabela de status da Fase 2. Registradas também a correção de responsividade do CategoryStrip (`011cdbb`) e a correção da referência de imagem do mapa de representantes (`f78da05`). Proposta técnica da Fatia 3.6 (Presença — `PresenceSection`) apresentada ao Jose, aguardando aprovação e revisão técnica antes da implementação; identificado ainda um ajuste não commitado do CategoryStrip (refinamento dos divisores visuais via gradiente) pendente de decisão sobre commit separado. |

---

# PARTE VII — REGISTRO HISTÓRICO DE INSTRUÇÃO PARA O AGENTE

> **Não copie o bloco histórico abaixo para novas sessões.** Ele foi criado antes do encerramento da Fase 1. Para onboarding atual, use `docs/PROMPT_COMUNICACAO_AGENTES.md`, o contrato operacional e o roadmap vigente deste Plano Mestre.

## Tarefa autorizada agora: concluir a Fase 1 — Design/frontend

> Copie o bloco abaixo para o agente (Claude, Codex ou outro) que for continuar o projeto.

```text
Leia integralmente PLANO_MESTRE_FORTSULSC.md antes de qualquer ação.
Leia também docs/PLANEJAMENTO_PROJETO.md, docs/RULES.md, docs/CHECKLIST.md
e docs/DESIGN-SYSTEM.md.

Consulte o SecondBrain, use os skills aplicáveis de addyosmani/agent-skills
(começando por using-agent-skills) e use Context7 para a documentação atual
de bibliotecas, frameworks, SDKs, APIs, CLIs ou serviços envolvidos.

Confirme o estado real do repositório (git status) antes de propor qualquer
mudança.

Você está autorizado a trabalhar SOMENTE na Fase 1 — Design/frontend.
Não inicie a Fase 2 (estrutura Next.js) nem a Fase Docker.
Não crie banco, autenticação, CRUD ou regra de negócio.
Não faça commit ou push sem autorização explícita do Jose.

Siga o fluxo de aprovação em duas camadas descrito na seção 4 da Parte I
do Plano Mestre para qualquer item abaixo que envolva uma decisão
estrutural (ex.: estrutura da página de produto): apresente a proposta,
aguarde aprovação do Jose, aguarde revisão do Claude, só então implemente,
entregue a lista de testes manuais no navegador, e só faça commit após
aprovação dupla (Jose + Claude). Itens puramente de ajuste visual pontual
não precisam do ciclo completo, mas mudanças de estrutura de página ou
navegação precisam.

Antes de tocar em qualquer arquivo, verifique se
recovery-codes-vercel-fortsul.txt ainda existe no working tree ou no
histórico do Git (git log --all --full-history -- recovery-codes-vercel-fortsul.txt).
Se existir em algum commit, pare e reporte — não prossiga sem essa
confirmação, mesmo que o arquivo já não esteja no diretório atual.

Escopo autorizado nesta etapa (ver seção "Fase 1" da Parte IV do Plano
Mestre e a coluna "Falta para considerar concluída"):

1. Página de produto individual, com estrutura comercial completa
   (imagens, aplicações, benefícios, especificações, CTA).
2. Página de erro 404.
3. robots.txt e meta description por página.
4. Passagem de Lighthouse (meta: performance e acessibilidade >= 90).
5. Teste manual cross-browser (Chrome, Safari, Firefox).

Não decida sozinho sobre os itens da Parte III do Plano Mestre
(Blog, Revendas, formulário de orçamento, perfis de admin, storage de
imagens, prioridade do painel administrativo, política de privacidade).
Esses pontos dependem de resposta do Jose. Se a ausência de resposta
bloquear alguma tela, implemente a versão mais conservadora (ex.: manter
Blog no menu como está, não criar página de Revendas ainda) e registre a
pendência, em vez de decidir por conta própria.

Ao terminar, apresente:
- lista do que foi implementado;
- lista do que ainda depende de decisão do Jose;
- diff proposto;
- proposta de atualização da tabela da seção 0.2 do Plano Mestre
  (não edite o Plano Mestre diretamente sem aprovação).

Pare e aguarde aprovação expressa do Jose antes de considerar a Fase 1
concluída e antes de qualquer sugestão de iniciar a Fase 2.
```
