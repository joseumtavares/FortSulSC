# PLANO MESTRE DE CONTROLE — PROJETO FORTSULSC

> Documento de contexto, governança técnica e execução por fases para qualquer agente (Claude, Codex ou outro) que trabalhar neste projeto.
>
> **Projeto:** FortSulSC — reformulação do site institucional/catálogo da FortSul Equipamentos Agrícolas
> **Stack atual:** Next.js, React, TypeScript, Prisma e PostgreSQL local via Docker; Tailwind CSS, shadcn/ui, Auth.js e Leaflet + OpenStreetMap continuam planejados por fase
> **Estado atual do código:** app Next.js em `src/`, frontend legado preservado, schema/migrations Prisma e testes de integração; não há autenticação, painel administrativo ou API de negócio aprovada
> **Abordagem:** modernização incremental por portões de aprovação; a fundação técnica existente não autoriza novas regras de negócio, rotas ou módulos fora da fatia aprovada por Jose
> **Data de consolidação:** 04 de setembro de 2026
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

A Fase 1 foi formalmente encerrada e seu baseline aprovado foi registrado no commit `88e7d6f`. A **Fase 2 — Estrutura Next.js** e a Fase Docker foram concluídas; a fundação Prisma (schema, migrations e testes de integração) já existe no repositório. As próximas mudanças continuam sujeitas à fatia aprovada e ao fluxo de revisão. As decisões consolidadas do planejamento, incluindo storage R2 servido pelo Next.js sem Spring Boot, permanecem registradas na Parte II.

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

Status consolidado em 04 de setembro de 2026:

| Status | Etapa | Situação atual | Próximo portão |
|---|---|---|---|
| 🟢 | Item de segurança — arquivo `recovery-codes-vercel-fortsul.txt` | Confirmado via GitHub: o repositório publicado (`joseumtavares/FortSulSC`) tem histórico com **1 commit único**, sem o arquivo. Como não existe commit anterior à remoção, não há histórico de Git para purgar. O Jose confirmou em 30/08/2026 que os códigos de recuperação expostos não são mais válidos. | Nenhuma; item de segurança encerrado. |
| 🟢 | Fase 0 — Planejamento e validação | `PLANEJAMENTO_PROJETO.md`, `ARCHITECTURE.md`, `API.md`, `COMPONENTS.md`, `DESIGN-SYSTEM.md`, `RULES.md` e `CHECKLIST.md` criados e revisados. Revisão técnica externa realizada. Repositório publicado no GitHub (`joseumtavares/FortSulSC`), commit inicial aprovado pelo Jose. | Nenhum; etapa concluída, mantida como referência viva. |
| 🟢 | Fase 1 — Design/frontend | Formalmente encerrada; baseline aprovado no commit `88e7d6f`. | Nenhum; preservada como baseline e referência de rollback. |
| 🟢 | Fase 2 — Estrutura Next.js | Tarefas 1A/1B, assets, migração visual da Home e revisão de regressão concluídas e aprovadas; a aplicação Next.js/TypeScript em `src/` é a base vigente. | Novas rotas ou módulos seguem a fatia e as aprovações aplicáveis. |
| 🟢 | Fase Docker — Fundação de conteinerização | Concluída e aprovada para commit: Dockerfile Next.js standalone, Compose com PostgreSQL vazio sem porta publicada no host, `.env.example`, `.dockerignore` e documentação local. `docker compose config --quiet`, build, saúde do PostgreSQL e resposta HTTP 200 da Home passaram. | A Fase 3 continua bloqueada até nova aprovação explícita do Jose, incluindo modelagem de dados e regras de negócio. |
| 🟢 | Fase 3 — Modelagem e regras de negócio | Encerrada formalmente por Jose em 08/09/2026, após as Fatias 4.1 a 4.7 (catálogo, geografia/parceiros, segurança administrativa, artigos + auditoria, banners + configurações institucionais, capa obrigatória de artigo, upload de imagem via R2). Texto LGPD e consulta pública de parceiro seguem pendentes, como itens paralelos que não bloqueiam a Fase 4. | Nenhum; preservada como base para novas fatias de schema quando a Fase 4 exigir. |
| 🟡 | Fase 4 — Painel administrativo | Iniciada em 08/09/2026. Nenhuma fatia implementada ainda. | Claude propõe a primeira fatia; implementar somente após aprovação formal de Jose. |
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
| Stack full stack: Next.js + TypeScript + PostgreSQL + Prisma + Tailwind + shadcn/ui + Leaflet/OSM | Next.js, TypeScript, PostgreSQL local e Prisma implementados; Tailwind, shadcn/ui e Leaflet/OSM permanecem planejados por fase |
| Frontend antes de backend | Aprovada |
| Backend/banco/regras de negócio só após aprovação explícita do Jose | Obrigatória |
| Separação entre dados públicos e privados de representantes (`representatives` vs `representative_private`) | Aprovada como modelo de referência, não implementada |
| Nenhum commit/push automático sem autorização do Jose | Aprovada |
| WhatsApp como canal principal de conversão nesta fase | Aprovada |
| Containerização do projeto com Docker | Implementada para ambiente local — ver Fase Docker na Parte IV |
| Fluxo de aprovação em duas camadas (Jose + revisão do Claude) obrigatório antes de qualquer implementação e antes de qualquer commit | Obrigatória |
| Contrato de testes em código antes de implementar regra de negócio nova, a partir da Fase 3 (equivalente à DEC-020 do projeto Nonna) | Obrigatória |
| Representantes/revendas já deram consentimento para publicação de nome, WhatsApp e localização aproximada (confirmado pelo Jose em 30/08/2026) | Aprovada — desbloqueia Fase 3 e Fase 5 quanto a este ponto |
| Revendas/representantes terão página pública própria, acessada pelo botão "Encontrar representante" dentro da seção Presença: mapa Leaflet à esquerda (marcador aparece ao selecionar um representante) e, à direita, os dados do representante selecionado (nome, telefone, redes sociais, link e logotipo) | Aprovada como especificação de produto (Jose, 30/08/2026), implementação pertence à Fase 5 (`RepresentativeMap`) |
| O "Blog" é mantido, mas com o nome "Novidades e dicas" | Aprovada e já implementada (`ContentSection`, Fatia 3.7) |
| Orçamento apenas via WhatsApp, sem formulário próprio nesta fase | Aprovada e já implementada (CTA/WhatsApp em toda a Home) |
| Admin terá dois perfis de usuário: Admin e Editor | Aprovada como especificação de produto (Jose, 30/08/2026), implementação pertence à Fase 3/4 |
| Edição de conteúdo via painel administrativo está aprovada arquiteturalmente | Aprovada como direção (Jose, 30/08/2026): a Fase 3 define os pré-requisitos do painel (modelagem, permissões e contratos); a implementação do dashboard permanece na Fase 4 |
| Política de privacidade já existe redigida pelo Jose (aguardando entrega do texto para publicação no rodapé) | Aprovada — desbloqueia o item de Fase 1 (link no rodapé); LGPD na Fase 3 segue dependendo do texto final |
| Os recovery codes expostos no repositório (`recovery-codes-vercel-fortsul.txt`) não são mais válidos (confirmado pelo Jose em 30/08/2026) | Resolvida — item de segurança da seção 0.2 encerrado |
| Storage de imagens: Cloudflare R2, servido por Route Handler/Server Action do próprio Next.js (sem serviço Spring Boot separado); PostgreSQL/Prisma guardam apenas `image_url`/`image_key`/`mime_type`/`size`, nunca a imagem em si (confirmado pelo Jose em 30/08/2026, opção (a)) | Aprovada — preserva a ADR-001-Stack-Fortsul (Next.js full-stack) sem introduzir Spring Boot; desbloqueia a modelagem de imagens na Fase 3 |
| Representantes e revendas serão unificados em uma única tabela `partners` (diferenciada por `PartnerType`: `REPRESENTATIVE`/`RESELLER`), com dados privados isolados em `partner_private` (1:1); hierarquia geográfica `Region → State → Municipality → CommercialArea` alimentada pela API oficial de Localidades do IBGE, inicialmente restrita à Região Sul (PR/SC/RS); todas as tabelas do catálogo (incluindo as já criadas na Fatia 4.1) passam a usar UUID nativo como chave primária (confirmado pelo Jose em 02/09/2026, `docs/Proposta_Tarefa_4_Fatia_4_2.md`) | Aprovada — substitui, só no nível de tabela, a linha acima sobre `representatives`/`representative_private`; a distinção entre representante e revenda continua obrigatória em toda UI, filtro, marcador e rota pública via campo `type`, nunca fundida sob o rótulo genérico "parceiro" (mantém `docs/PLANEJAMENTO_PROJETO.md` §8 e a decisão D1 da entrevista ao cliente) |

---

# PARTE III — DECISÕES PENDENTES DO JOSE

Em 30/08/2026 o Jose respondeu a todas as nove perguntas que estavam nesta seção, incluindo o ponto de storage de imagens (confirmado sem Spring Boot, preservando a ADR-001). Todas as respostas foram movidas para a Parte II. Nenhuma decisão pendente no momento — esta seção fica registrada como referência de processo, para ser reaberta se novas perguntas estruturais surgirem.

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

## Fase 2 — Estrutura Next.js 🟢

Objetivo concluído: migrar o frontend aprovado para a base Next.js + TypeScript,
seguindo a estrutura de pastas de `ARCHITECTURE.md`. A aplicação em `src/` é a
base vigente para as próximas fatias.

Importante: a pasta `app/api/` nasce vazia/placeholder nesta fase — não implica API funcional.

Pendência aberta: a seção “Novidades e dicas” utiliza conteúdo de teste
aprovado exclusivamente para validação de layout. Os três cards devem ser
substituídos por conteúdo de lançamento antes da publicação da seção.

Iniciativa aprovada em 03/09/2026, aguardando implementação: redesign de `#solucoes` (tabs animadas + carrossel horizontal por scroll), incluindo adoção de `motion` (não `framer-motion`, descontinuado) como primeira dependência de UI do frontend. Especificação completa em `docs/Proposta_Solucoes_Scroll_Tabs.md`; worktree `feature/solucoes-scroll-tabs` já criada, sem código de produção ainda.

## Fase Docker — Fundação de conteinerização 🟢

Objetivo: rodar o projeto em container antes de a modelagem de banco (Fase 3) começar, para que schema e migrations já nasçam testáveis em ambiente isolado — mesmo cuidado adotado no projeto Nonna com a "Fase Docker 0".

Estado atual: implementação, revisão do Claude e validação manual do Jose
concluídas. A restrição original desta fase — não configurar Prisma nem conexão
real antes da modelagem — é histórica; o repositório atual já possui Prisma,
migrations e testes de integração nas fatias posteriores aprovadas.

Entregáveis esperados:
- `Dockerfile` para a aplicação Next.js;
- `docker-compose.yaml` com serviço da aplicação e serviço PostgreSQL para desenvolvimento local;
- `.env.example` na raiz, sem valores reais;
- documentação de como subir o ambiente localmente (`docker compose up`);
- confirmação de que a aplicação sobe e responde dentro do container antes de qualquer migration ser criada.

Segue o mesmo fluxo de aprovação da seção 4 do Plano Mestre: proposta da estrutura de containers → aprovação do Jose → revisão do Claude → implementação → testes smoke → lista de verificação manual para o Jose → aprovação dupla → commit.

Não incluir nesta fase: schema Prisma, migrations, dados reais, credenciais de produção dentro do container ou do `docker-compose.yaml`.

## Fase 3 — Modelagem e regras de negócio 🟢

Objetivo: evoluir banco, entidades, permissões e regras de negócio somente nas
fatias aprovadas. A fundação de catálogo, geografia/parceiros e segurança
administrativa já está presente em schema, migrations e testes de integração.

A Fatia 4.4 adicionou `Article` e `AuditLog` na worktree
`feature/codex-fatia-4-4`. A implementação mantém artigos em rascunho por
padrão, separa consultas públicas da autoria e modela auditoria sem campos de
texto livre. Jose revisou e aprovou formalmente a fatia antes do commit; a
migration foi aplicada, os testes de integração passaram, a implementação foi
integrada à `main` e o deploy online foi validado na Vercel. A Fatia 4.5, em
sequência, adiciona `Banner` e `InstitutionalSettings` com a mesma lógica de
conteúdo institucional sem rota pública ainda. A fatia não adiciona rota, CRUD
ou painel. A Fatia 4.6, em sequência, adiciona à `Article` os campos opcionais
de imagem de capa (`coverImageUrl`, `coverImageKey`, `coverImageMime`,
`coverImageSize`, `coverImageAlt`) e a regra de negócio aprovada por Jose em
08/09/2026: um artigo não pode ser publicado sem `coverImageUrl` nem sem
`coverImageAlt` semanticamente válido (não nulo, não vazio, não composto só de
espaços), aplicada de forma alinhada na constraint de banco (`CHECK` com
`btrim`) e na guarda de aplicação em `publishArticle`. A consulta pública
(`findArticleBySlugPublic`) expõe somente `coverImageUrl` e `coverImageAlt`;
`coverImageKey`, `coverImageMime` e `coverImageSize` são de uso
interno/administrativo e não são retornados por essa consulta. A fatia não
adiciona rota, CRUD, upload ou painel.

A Fatia 4.7, aprovada por Jose em 08/09/2026 (limite de 5 MB, rota
`POST /api/admin/articles/[id]/cover`, exclusão da imagem antiga ao
substituir), implementa o upload de capa de artigo definido arquiteturalmente
na Parte II: uma interface `ImageStorage` (`src/lib/storage/image-storage.ts`)
com duas implementações trocáveis por `STORAGE_PROVIDER` — `local` (simulada,
sem chamada externa, para desenvolvimento/testes) e `r2` (Cloudflare R2 via
`aws4fetch` — pacote sem dependências transitivas, mais leve que o SDK
oficial da AWS para o mesmo fim; único pacote de terceiro adicionado nesta
fatia) — seguindo o mesmo padrão de configuração já usado para e-mail
(`src/lib/auth/email-config.ts`). A rota exige sessão administrativa (RBAC
`ADMIN`/`EDITOR`) e origem válida, valida MIME (`jpeg`/`png`/`webp`) e tamanho
(até 5 MB), exige texto alternativo no mesmo request, e exclui a imagem
anterior do storage após atualizar o banco com sucesso. Esta é a primeira
rota do projeto a combinar sessão + RBAC em um Route Handler e a primeira a
processar corpo `multipart/form-data`. A fatia não adiciona painel/UI de
upload (Fase 4).

**Fase 3 formalmente encerrada por Jose em 08/09/2026**, após a Fatia 4.7,
com a modelagem, permissões e contratos de teste das Fatias 4.1 a 4.7
cobrindo catálogo, geografia/parceiros, segurança administrativa, artigos +
auditoria, banners + configurações institucionais, capa obrigatória de
artigo e upload de imagem via R2. O encerramento não significa que a
modelagem de dados está fechada para sempre: schema/migrations novos ainda
podem ser propostos dentro da Fase 4 quando uma funcionalidade do painel
exigir, seguindo o mesmo fluxo de aprovação da seção 4.

Dois itens ficam como pendências paralelas, sem bloquear o início da Fase 4:
o texto final da política de retenção/exclusão (LGPD), ainda não entregue
por Jose; e a consulta pública de parceiro/representante com seleção
explícita de campos públicos vs privados (`Partner`/`PartnerPrivate`), ainda
não implementada em código — pré-requisito da Fase 5, não da Fase 4.

O storage de imagens já está definido (Parte II): Cloudflare R2, servido por
Route Handler/Server Action do próprio Next.js, sem serviço Spring Boot,
preservando a ADR-001.

A partir desta fase, toda proposta de regra de negócio deve seguir o fluxo completo da seção 4 e vir acompanhada do contrato de testes em código (não em prosa), antes de qualquer Model, Service, Route Handler ou Server Action ser escrito.

## Fase 4 — Painel administrativo 🟡

Objetivo: dashboard interno para produtos, categorias, representantes, revendas, regiões, banners e configurações.

Fase 3 formalmente encerrada e aprovada por Jose em 08/09/2026 — o portão
para iniciar esta fase foi atendido. O Jose já havia aprovado
arquiteturalmente a edição via painel (30/08/2026, Parte II). Nenhuma fatia
desta fase começa sem proposta técnica e aprovação explícita de Jose,
seguindo o mesmo fluxo usado na Fase 3 (seção 4).

## Fase 5 — Mapa e dados públicos 🔴

Objetivo: implementar `RepresentativeMap` com Leaflet + OpenStreetMap, na página dedicada acessada pelo botão "Encontrar representante" (mapa à esquerda, dados do representante selecionado à direita — nome, telefone, redes sociais, link e logotipo), conforme especificação aprovada pelo Jose em 30/08/2026 (Parte II).

Pré-condição obrigatória: consentimento de representantes já confirmado (Parte II); falta apenas a regra de dados públicos vs privados ser implementada e testada na Fase 3/4.

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
- citar o item de segurança do recovery codes e seu status atual (histórico publicado sem o arquivo; Jose confirmou em 30/08/2026 que os códigos não são mais válidos — item encerrado) antes de qualquer commit;
- reconhecer que não há mais perguntas pendentes do Jose na Parte III; todas as nove foram respondidas em 30/08/2026 e estão na Parte II, incluindo o storage de imagens (R2 via Next.js, sem Spring Boot, preservando a ADR-001);
- diferenciar o legado estático preservado da fundação já existente (Next.js,
  Prisma e Docker) e dos módulos ainda planejados (painel, autenticação, mapa e
  APIs de negócio);
- não iniciar uma nova fatia da Fase 3 sem aprovação explícita e suas dependências;
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
| 29/08/2026 | Fatias 3.6 (Presença, `8bf9069`/`ca15453`), 3.7 (Novidades e dicas + correções mobile, `63718fb`/`fdcc175`) e 3.8 (CTA final, `0f1f1e0`/`8b1b6ab`) concluídas e mescladas, além da correção visual da seção Empresa (`9a18eae`) e do refinamento dos divisores do CategoryStrip (`61e94cf`). Tarefa 3.9 — revisão de regressão completa da Home nos breakpoints 1440×900, 1024×768, 800×1024 e 390×844 — concluída: estrutura, CSS, acessibilidade e o fluxo CTA/WhatsApp conferem com o baseline; `typecheck`, `test:static` e `next build` passaram sem erro. Nenhuma regressão objetivamente confirmada foi encontrada; as duas divergências identificadas (círculo/"F" da seção Empresa e responsividade do CategoryStrip) são mudanças já aprovadas e documentadas, não regressões. Pendência remanescente: validar manualmente os quatro breakpoints e o console no navegador Windows, pois o `next dev` não roda de forma estável no ambiente WSL usado nesta revisão (erro de lockfile do cache do Turbopack em `/mnt/c`). |
| 30/08/2026 | Jose respondeu às nove perguntas da Parte III. Movidas para Parte II como decisões aprovadas: consentimento de representantes/revendas; especificação da página pública de representantes (mapa Leaflet à esquerda, dados à direita, acessada pelo botão "Encontrar representante"); manutenção do Blog como "Novidades e dicas" (já implementado); orçamento só por WhatsApp (já implementado); dois perfis de admin (Admin, Editor); edição via painel aprovada arquiteturalmente com implementação na Fase 3; política de privacidade já redigida (aguardando texto para o rodapé); confirmação de que os recovery codes expostos não são mais válidos (item de segurança encerrado). Mantido em Parte III, sem resolução: a resposta sobre storage de imagens propõe um serviço Spring Boot entre Next.js e Cloudflare R2, o que contradiz diretamente a ADR-001-Stack-Fortsul (que avaliou e rejeitou "Spring Boot + React separados" como overengineering). Aguardando confirmação do Jose sobre manter R2 servido só pelo Next.js (preservando a ADR-001) ou formalizar uma revisão da ADR-001 para incluir Spring Boot. Atualizadas as dependências das Fases 3, 4 e 5 e o item de segurança da tabela de status para refletir essas respostas. |
| 30/08/2026 | Jose resolveu o conflito de storage de imagens: opção (a) — manter Cloudflare R2 como storage, servido exclusivamente por Route Handler/Server Action do próprio Next.js, sem serviço Spring Boot, preservando a ADR-001-Stack-Fortsul como aceita. Decisão movida da Parte III para a Parte II como aprovada. A Parte III fica sem itens pendentes. Atualizadas as referências correspondentes na introdução (seção 0), na tabela de status da Fase 2 (seção 0.2), no objetivo da Fase 2, na Fase 3 e na Parte V. |
| 31/08/2026 | Jose concluiu e aprovou a validação visual da Tarefa 3.9 no site publicado, cobrindo as resoluções desktop, tablet e mobile informadas. Não foram encontradas regressões. Identificado e corrigido o espaçamento do título “A parceria continua depois da entrega.” em telas móveis, onde a ocultação do `<br>` unia as palavras. |
| 31/08/2026 | Fase Docker implementada no worktree `feature/codex-docker`: Dockerfile Next.js standalone com usuário não-root, Compose com PostgreSQL vazio restrito à rede interna, `.env.example` sem senha, `.dockerignore` e instruções locais. Validações aprovadas: `docker compose config --quiet`, build, PostgreSQL healthy/`pg_isready` e Home HTTP 200. Sem Prisma, migrations, `DATABASE_URL`, `depends_on` no app ou conexão real app→banco. Aguarda revisão do Claude e validação manual do Jose antes de commit. |
| 01/09/2026 | Jose aprovou formalmente a Fase 2 — Estrutura Next.js — após a conclusão e validação da Tarefa 3.9. O portão para iniciar a Fase Docker foi atendido. A Fase Docker recebeu revisão aprovada do Claude e validação manual aprovada do Jose, ficando autorizada para commit; a Fase 3 permanece bloqueada até nova aprovação explícita do Jose. |
| 04/09/2026 | Corrigido descompasso documental: RULES, ARCHITECTURE e o estado vigente deste Plano Mestre passam a reconhecer a fundação Next.js/Prisma/Docker e as migrations/testes de integração presentes no repositório. Mantido o bloqueio de novas fatias, rotas, autenticação, painel e regras fora do escopo aprovado. |
| 07/09/2026 | Fatia 4.5 (Banner + InstitutionalSettings) implementada na worktree atual: schema/migration Prisma com `Banner`, `InstitutionalSettings` e `AuditEntityType.BANNER`, repositórios mínimos e contratos de teste em código. `npm run typecheck`, `npm run lint`, `npm test` e `npm run build` passaram; a suíte unitária nova passou (6 testes). A suíte de banco local (`npm run test:db`) ficou bloqueada pelo ambiente: `DATABASE_URL` desta sessão aponta para Supabase e o Docker Desktop/Linux engine retornou 500 ao tentar subir o stack local com variáveis temporárias. Sem rota, CRUD ou painel nesta fatia. |
| 08/09/2026 | Fatia 4.6 (imagem de capa obrigatória para publicação de `Article`) revisada na worktree `codex-fati-4-6`. O `scope-gate-reviewer` do Claude identificou três pendências bloqueadoras na implementação inicial: exposição de `coverImageKey`/`coverImageMime`/`coverImageSize` na consulta pública, alteração não relacionada em `src/app/api/admin/login/password/route.ts` e ausência de registro formal desta decisão neste Plano. Jose analisou o parecer e aprovou o escopo final, determinando as correções antes do commit: (1) a consulta pública passa a selecionar somente `coverImageUrl` e `coverImageAlt`; (2) a constraint de banco e a guarda em `publishArticle` passam a exigir `cover_image_alt` não nulo, não vazio e não composto só de espaços (`btrim`), alinhadas entre migration e aplicação; (3) a alteração em `password/route.ts` foi revertida para a versão da `main`, por não pertencer ao escopo desta fatia — fica registrada como melhoria a propor separadamente, se útil; (4) este registro formaliza a decisão na fonte de verdade do projeto. Commit, merge e push permanecem pendentes da suíte de testes, validação visual/manual de Jose e aprovação dupla final. |
| 08/09/2026 | Fatia 4.6 concluída: commit `be89140` na branch `codex/fatia-4-6`, mesclado à `main` em `a79b50a` (fast-forward dos commits operacionais `9a68730`/`eaf5e38`/`9759102` que exigem e-mail real no Docker local e portam `bootstrap-preview-worktree`, `start-preview-local` e `seed-preview-admin` de PowerShell para Node multiplataforma). `lint`, `typecheck`, `npm test` (32 arquivos/84 testes) e `npm run build` aprovados na `main` pós-merge, antes do push. Jose validou visualmente e testou o login/MFA completo no deploy publicado na Vercel, sem regressão. Push para `origin/main` concluído. Fase 3 permanece 🟡 (mais fatias podem seguir, mediante nova proposta e aprovação). |
| 08/09/2026 | Jose decidiu não encerrar a Fase 3 ainda e aprovou a Fatia 4.7 (upload de imagem de capa via Cloudflare R2) antes de reavaliar o encerramento. Escopo aprovado: limite de 5 MB, rota `POST /api/admin/articles/[id]/cover`, exclusão da imagem antiga ao substituir. Implementada na worktree `claude-fatia-4-7-cover-upload` (branch `feature/claude-fatia-4-7-cover-upload`): interface `ImageStorage` trocável (`local`/`r2`) seguindo o padrão de `email-config.ts`. Dependência nova inicial: `@aws-sdk/client-s3`; trocada por `aws4fetch` (sem dependências transitivas, mais leve, feito para assinar requisições `fetch` a APIs compatíveis com S3) após Jose pedir uma alternativa mais leve antes de confirmar. Route Handler com sessão + RBAC (`ADMIN`/`EDITOR`, confirmado por Jose) + validação de origem/MIME/tamanho/alt. `lint`, `lint:types` e `typecheck` aprovados; `npm run test:unit` aprovado (35 arquivos/107 testes, incluindo os novos). `npm run build` ainda não validado nesta worktree nova por falta de `.env` local (nenhum `.env` foi copiado de outra worktree, conforme regra); dois itens da Fase 3 seguem pendentes de decisão de Jose, independente desta fatia: texto final da política de retenção/exclusão LGPD e o próprio encerramento da fase. Commit, merge e push permanecem pendentes de revisão de escopo, testes completos e aprovação dupla. |
| 08/09/2026 | Fatia 4.7 concluída: commit `2d37f08` na branch `feature/claude-fatia-4-7-cover-upload`, mesclado à `main` por fast-forward (sem divergência de histórico). `.env` novo gerado para a worktree (segredos aleatórios, nunca copiados), Postgres isolado com as 7 migrations e seed aplicados, `npm run test:db` aprovado (6 arquivos/45 testes) e `npm run build` aprovado nessa worktree antes do merge. Após o merge, `npm install` (nova dependência `aws4fetch`), `lint`, `typecheck`, `npm test` (35 arquivos/109 testes) e `npm run build` repetidos e aprovados na `main`. Push para `origin/main` concluído; Jose validou o deploy publicado na Vercel sem erro. Fase 3 permanece 🟡 — texto final da política LGPD e a decisão de encerrar a fase continuam em aberto, independentes desta fatia. |
| 08/09/2026 | Jose pediu análise do Plano Mestre para decidir a próxima tarefa entre a Fase 5 (mapa de representantes) ou reavaliar a fase vigente. Análise: a Fase 5 exige conclusão da Fase 4 (não iniciada) e a regra de código de dados públicos vs privados de `Partner`/`PartnerPrivate` (não implementada, só o schema da Fatia 4.2 existe) — pular para a Fase 5 deixaria a futura página pública sem a seleção explícita de campos exigida por `CLAUDE.md` §14. Diante disso, Jose decidiu **encerrar formalmente a Fase 3** (🟡 → 🟢) e **iniciar a Fase 4 — Painel administrativo** (🔴 → 🟡), atualizando a Parte IV e a tabela de status (seção 0.2). Texto LGPD e consulta pública de parceiro seguem como pendências paralelas, não bloqueantes. Nenhuma fatia da Fase 4 foi implementada ainda; a primeira depende de proposta técnica e aprovação formal de Jose. |

---

# PARTE VII — REGISTRO HISTÓRICO DE INSTRUÇÃO PARA O AGENTE

> **Não copie o bloco histórico abaixo para novas sessões.** Ele foi criado antes do encerramento da Fase 1 e antes de o Jose responder às questões então pendentes da Parte III, em 30/08/2026. As decisões foram tomadas pelo Jose — não por agentes — e estão registradas na Parte II. Para onboarding atual, use `docs/PROMPT_COMUNICACAO_AGENTES.md`, o contrato operacional e o roadmap vigente deste Plano Mestre.

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
