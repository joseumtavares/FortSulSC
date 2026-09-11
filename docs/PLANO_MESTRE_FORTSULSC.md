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
| Storage de imagens: Cloudflare R2 ou Supabase Storage (provedores intercambiáveis via a interface `ImageStorage`/`STORAGE_PROVIDER`, ambos servidos por Route Handler do próprio Next.js, sem serviço intermediário separado); PostgreSQL/Prisma guardam apenas `image_url`/`image_key`/`mime_type`/`size`, nunca a imagem em si (R2 confirmado pelo Jose em 30/08/2026, opção (a); Supabase Storage adicionado em 10/09/2026 para testar no mesmo ambiente Vercel + Supabase já usado pelo banco) | Aprovada — preserva a ADR-001-Stack-Fortsul (Next.js full-stack) sem introduzir serviço intermediário próprio; desbloqueia a modelagem de imagens na Fase 3 |
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
| 09/09/2026 | Primeira fatia da Fase 4 — estilo visual do painel — proposta em `docs/Proposta_Fase4_Fatia_1_Design_System_Painel.md` e aprovada por Jose: Tailwind CSS v4 + `lucide-react` isolados a `src/app/admin/**` (site público continua em CSS puro), tela estática de referência em `/admin/preview-dashboard` (dado fictício, fora do login real), paleta institucional, ícones do menu no domínio FortSulSC. Implementada na worktree `claude-fase4-painel-base` (branch `feature/claude-fase4-painel-base`). `ui-reviewer` encontrou e corrigiu 2 achados bloqueantes (nome acessível ausente nos botões de navegação quando o rótulo fica oculto; landmark `<main id="conteudo">` ausente, quebrando o skip-link global) e 3 ajustes de fidelidade ao design system (token de cor de borda e de fonte mapeados no tema; contraste do badge numérico). Jose aprovou o resultado visual e pediu a troca do logotipo grande do sidebar pelo ícone compacto (`public/icon.png`), aplicada. |
| 09/09/2026 | Jose pediu para implementar junto, na mesma worktree, a estrutura real do painel (proposta técnica anterior de "estrutura base do painel administrativo"), reaproveitando o shell visual recém-aprovado. Adicionados: `src/components/admin/AdminShell.tsx`/`AdminSidebar.tsx` (sidebar compartilhada entre a prévia e a página real), `src/app/admin/(dashboard)/layout.tsx` (exige sessão real via `auth()`, redireciona para `/admin/login` se ausente) e `.../page.tsx` (painel real: nome/e-mail/papel do admin logado + logout funcional). `LoginForm` corrigido para redirecionar ao `/admin` real em vez do artefato de teste da Fatia 4.3. Validado de ponta a ponta com login real (senha → código por e-mail via Resend, lido pelo Gmail do Jose conectado à sessão → sessão autenticada → `/admin` renderiza dados reais → logout encerra a sessão de verdade). Dois bugs reais encontrados e corrigidos no processo: overflow horizontal do título no mobile (`min-w-0` + `break-words`) e o redirecionamento pós-login apontando para a tela antiga. `lint`, `typecheck`, `npm run test:unit` (36 arquivos/112 testes) e `react-doctor --scope changed` (sem achados) aprovados. Commit `a8e5955` na branch `feature/claude-fase4-painel-base`, mesclado à `main` em `49f06d2` após reconciliar o registro deste Plano (a edição de encerramento da Fase 3 estava pendente de commit direto na `main` desde a entrada anterior). `npm install`, `lint`, `typecheck`, `npm test` (36 arquivos/112 testes) e `npm run build` repetidos e aprovados na `main` pós-merge. Push para `origin/main` concluído; Jose validou o deploy publicado na Vercel sem erro (painel real, prévia visual e login). |
| 09/09/2026 | Segunda fatia da Fase 4 — CRUD de artigos ("Novidades e dicas") — proposta e aprovada por Jose: slug gerado automaticamente do título (com sufixo numérico em colisão); sem exclusão de artigo, publicar/despublicar via caixa de seleção única (reaproveitável); auditoria (`AuditLog`, já existente desde a Fatia 4.4) gravada em CREATE/UPDATE/PUBLISH/UNPUBLISH. Implementada na worktree `claude-articles-crud` (branch `feature/claude-articles-crud`): rotas `POST/PATCH /api/admin/articles[/[id]]` e `POST /api/admin/articles/[id]/publish|unpublish`, guard compartilhado `requireAdminRequest` (origem+sessão+RBAC) para as rotas novas, telas `/admin/articles` (lista), `/novo` (criação) e `/[id]` (edição com capa via rota já existente da Fatia 4.7), sidebar do painel passando a navegar de verdade para "Dashboard" e "Novidades e dicas". `ui-reviewer` sem achados bloqueantes (2 ajustes de acessibilidade aplicados: área de toque do checkbox de publicação, `<caption>` da tabela de listagem). `react-doctor --scope changed`: 84/100, sem achados tratados como bloqueantes (avisos considerados falso-positivo/trade-off aceito: checagem de status do `fetch` após `.json()`, `<img>` simples para capa vinda de URL externa não configurada em `remotePatterns`). `lint`, `typecheck` e `npm run test:unit` (44 arquivos/150 testes) aprovados; fluxo completo validado ponta a ponta contra Postgres real via Docker isolado desta worktree (criar → editar → publicar bloqueado sem capa, auditado como FAILURE → enviar capa → publicar com sucesso → despublicar), acesso não autenticado corretamente rejeitado. Durante o teste manual do Jose no servidor local, corrigido um bug real e não relacionado à fatia: `h1`/`h2` do painel apareciam com o tamanho do hero do site público porque `globals.css` define esses seletores fora de `@layer`, e regras fora de camada sempre vencem as camadas do Tailwind usadas em `/admin/**`, independente de especificidade — corrigido com a classe `admin-panel` em `AdminShell` mais um bloco de CSS também fora de camada, restaurando os tamanhos pretendidos só dentro do painel. Commit, merge e push permanecem pendentes de revisão final e aprovação dupla. |
| 09/09/2026 | Durante o teste manual da fatia acima, Jose pediu a reversão da nota da Fatia 4.6 ("só imagem de capa agora, sem galeria"): artigos passam a ter uma galeria de imagens adicionais, exibida ao final do artigo publicado. Proposta técnica registrada em `docs/Proposta_Fase4_Fatia_2_Galeria_Imagens_Artigo.md` e aprovada por Jose, com dois ajustes: exclusão de uma imagem individual da galeria sempre permitida (não se confunde com a regra "sem exclusão" de artigo, que é sobre o ciclo de vida do artigo inteiro) e limite de 4 imagens por artigo (Jose reduziu de 10, sugestão original da proposta, para 4). Implementado na mesma worktree: novo model Prisma `ArticleImage` (migration `20260910003843_fatia_4_2_article_gallery`), rotas `POST`/`DELETE /api/admin/articles/[id]/images[/[imageId]]` reaproveitando `ImageStorage` (local/r2) e o guard `requireAdminRequest` já usados no restante da fatia, auditoria como `UPDATE` do artigo (sem novo `AuditAction`), componente `ArticleGallery` na tela de edição. `ui-reviewer` sem achados bloqueantes (1 ajuste de acessibilidade aplicado: `aria-label` diferenciando os botões "Remover" por imagem). `lint`, `typecheck`, `npm run test:unit` (48 arquivos/174 testes) e `npm run test:db` (6 arquivos/45 testes) aprovados. Página pública do artigo (consumidora da galeria) permanece fora do escopo desta fatia. Commit, merge e push permanecem pendentes de revisão final e aprovação dupla. |
| 09/09/2026 | Jose pediu, ainda durante o mesmo teste manual, que a seção pública "Novidades e dicas" (`ContentSection`, aprovada na Fatia 3.7) passasse a mostrar os artigos reais publicados no painel, com rolagem automática (carrossel infinito) e um popup por artigo (texto completo + galeria rotativa), substituindo os 3 cards fixos de teste. O `scope-gate-reviewer` identificou que isso seria a primeira consulta do site público ao Prisma/Postgres (até então só o painel administrativo acessava o banco) e que a entrada anterior desta fatia já havia registrado essa página pública como fora de escopo — parou o trabalho e pediu proposta técnica formal antes de prosseguir. Proposta registrada em `docs/Proposta_Fase4_Fatia_2_Novidades_Publicas.md` e aprovada por Jose: nova função `listPublishedArticlesPublic()` com seleção explícita de campos (nunca `authorId`/`imageKey`/`mimeType`/`size`); home continua estática (gerada uma vez, rápida), atualizando via `revalidatePath('/')` chamado pelas rotas `publish`/`unpublish` assim que um artigo é publicado ou despublicado (em vez de consultar o banco a cada visita); mudança implementada na mesma worktree/branch do CRUD de artigos. Implementado: `ContentSection` virou Server Component assíncrono que busca os dados e repassa prontos para `ContentSectionView` (síncrona, testável); novos componentes `ContentCarousel` (rolagem automática via CSS, pausa em hover/foco, respeita `prefers-reduced-motion`) e `ContentArticleDialog` (modal nativo, mesmo padrão de acessibilidade do `WhatsAppDialog` já aprovado); busca envolvida em `try/catch` retornando estado vazio ("Em breve, novidades e dicas por aqui.") se o banco estiver indisponível no momento da geração estática, para nunca quebrar o build. `ui-reviewer` encontrou 2 achados bloqueantes de acessibilidade, corrigidos: a galeria automática do popup não respeitava `prefers-reduced-motion` nem parava ao usuário navegar manualmente pelas setas/bolinhas (WCAG 2.2.2). Também corrigidos, por consistência: `key` React trocado de título do artigo (pode colidir) para `id`; botão fechar do popup deixou de rolar junto com o texto em artigos longos; bolinhas de navegação da galeria ganharam área de toque maior; papel ARIA das bolinhas trocado de `tablist`/`tab` (que implicava navegação por seta não implementada) para `group`; removida a regra CSS `.content-grid` órfã do layout antigo em grade. `lint`, `typecheck`, `npm run test:unit` (48 arquivos/179 testes), `npm run test:db` (45 testes) e `npm run build` aprovados — `/` continua marcada como página estática (`○`) mesmo consultando o banco na geração. `docs/COMPONENTS.md` e `docs/DESIGN-SYSTEM.md` (seção 13, Modais) atualizados para refletir os componentes reais. Commit, merge e push permanecem pendentes de revisão final e aprovação dupla. |
| 10/09/2026 | Três ajustes finais antes do commit, todos encontrados no teste manual do Jose: (1) bug real — `next/image` rejeitava a URL da capa/galeria (`local://...` em teste, e futuramente qualquer domínio de storage não cadastrado em `remotePatterns`); corrigido trocando para `<img>` simples no `ContentCard` e no `ContentArticleDialog`, mesmo padrão já usado nas telas de upload do painel (`ArticleCoverUploadForm`/`ArticleGallery`); (2) o carrossel público parava de rolar porque a regra de pausa por `:hover` cobria toda a seção — removida, mantendo só a pausa por `:focus-within` (necessária para acessibilidade de teclado), carrossel agora roda continuamente; (3) Jose pediu suporte a Supabase Storage como mais um provedor, além de local/R2, na mesma abstração trocável `ImageStorage`/`getImageStorageConfig` já existente desde a Fatia 4.7 — implementado `SupabaseImageStorage` (upload/delete via API REST do Supabase Storage, sem SDK novo, mesma filosofia de dependência leve do `aws4fetch`), ativado por `STORAGE_PROVIDER=supabase` com as variáveis `SUPABASE_STORAGE_URL`/`SUPABASE_STORAGE_SERVICE_KEY`/`SUPABASE_STORAGE_BUCKET` (nomes definidos pelo Jose, que já criou o bucket público `fortsul` no Supabase para teste). `lint`, `typecheck` e `npm run test:unit` (48 arquivos/185 testes) aprovados. Jose autorizou verbalmente commit, merge e push desta fatia completa (CRUD de artigos + galeria + Novidades e dicas pública + Supabase Storage) para testar direto no deploy da Vercel. |
| 10/09/2026 | Fatia concluída: commits `78f8568` (feature) e `2fec648` (reconciliação de registro pendente do Plano) na branch `feature/claude-articles-crud`, mesclados à `main` em `f8612d7`. Validação pós-merge na `main` encontrou e corrigiu dois problemas reais antes do push, ambos fora do escopo de negócio da fatia: (1) `ContentSectionView` importado do mesmo arquivo do `ContentSection` assíncrono carregava em cascata o cliente Prisma, que lança erro sem `DATABASE_URL` — quebraria em qualquer ambiente sem banco configurado (CI, checkout limpo); isolado em `src/components/sections/ContentSectionView.tsx`, sem dependência de banco, confirmado rodando a suíte com `DATABASE_URL` propositalmente ausente; (2) `vitest.config.ts` excluía só `**/.worktrees/**`, deixando vazar para a suíte da `main` os testes de uma worktree de outra tarefa em `.claude/worktrees/**`; padrão de exclusão ampliado. Commit `96c72f6` com as duas correções. `lint`, `typecheck`, `npm run test:unit` (185 testes, confirmados sem `DATABASE_URL`) e `npm run build` (confirmado sem `DATABASE_URL`, cai no estado vazio da seção pública em vez de quebrar) aprovados na `main`. `npm run test:db` não pôde ser confirmado na `main` por falta de Postgres local nesse checkout (mesma limitação já registrada na Fatia 4.5); a lógica de banco já foi validada de ponta a ponta na worktree isolada. Push para `origin/main` concluído (`43c1415..96c72f6`). Aguardando validação de Jose no deploy publicado na Vercel, incluindo o teste do bucket Supabase Storage (variáveis de ambiente precisam ser cadastradas também no painel da Vercel, não só no `.env` local). |
| 10/09/2026 | Terceira fatia da Fase 4 — CRUD de Banners e Configurações institucionais — proposta pelo Claude em `docs/Proposta_Fase4_Fatia_3_Banners_Configuracoes.md` e implementada pelo Codex na worktree `codex-fase4-fatia3-banners-configuracoes` (branch `codex/fase4-fatia3-banners-configuracoes`), reaproveitando integralmente os padrões já aprovados (`requireAdminRequest`, `recordAuditEvent`, `ImageStorage`, layout `(dashboard)`). Na revisão do Claude antes do commit, o `scope-gate-reviewer` identificou que a proposta e os 3 pontos do seu §11 (adicionar `ACTIVATE` ao enum `AuditAction`; banner sem exclusão física, só ativar/desativar; lista de redes sociais Facebook/Instagram/LinkedIn/YouTube com `https://` obrigatório) não tinham registro de aprovação explícita de Jose — o Codex já havia implementado com as suposições conservadoras que a própria proposta permite nesse caso. Jose confirmou nesta conversa a aprovação das 3 suposições conservadoras como estão implementadas, resolvendo o achado. O `ui-reviewer` não encontrou bloqueador de acessibilidade/responsividade; achados de consistência visual corrigidos: botões primários novos usavam `bg-brand-orange-dark` como cor base sem estado de `:hover` (idêntico à cor base) — trocado para o padrão já usado em `articles/page.tsx`/`ArticleTextForm.tsx` (`bg-brand-orange` com `transition-colors hover:bg-brand-orange-dark`) em `BannerForm.tsx`, `InstitutionalSettingsForm.tsx` e `banners/page.tsx`. `lint`, `typecheck`, `npm run test:unit` (245 testes) e `npm run test:db` (45 testes, contra Postgres real após recriar o volume desta worktree) aprovados; `npm run build` aprovado com todas as rotas novas compiladas. Durante a preparação do ambiente local foram encontrados e corrigidos dois problemas reais de infraestrutura, sem relação com a regra de negócio desta fatia, ambos documentados em `docs/WORKTREE_PREVIEW.md`: (1) `vitest run src/lib/db` (`test:db`) não carregava nenhum arquivo de variáveis sozinho — corrigido carregando `dotenv` (`.env.local` com fallback para `.env`) em `vitest.setup.ts`; (2) a migration que cria a role restrita `fortsul_app` a cria sem senha, de propósito (evita commitar segredo em SQL versionado), exigindo `ALTER ROLE ... WITH PASSWORD` manual após qualquer recriação do volume Postgres — sem esse passo, toda rota autenticada falha silenciosamente. Também corrigido um bug real e não relacionado nesta mesma sessão, em `scripts/bootstrap-preview-worktree.mjs`: `next-env.d.ts` é gerado pelo Next.js e ignorado pelo Git, então uma worktree nova legitimamente nasce sem ele — o bootstrap antigo exigia o arquivo já existente e falhava; agora recria o conteúdo padrão automaticamente. Jose testou manualmente login (senha + código por e-mail via Resend) e o fluxo completo de Banners/Configurações no servidor local (via `docker compose up --build -d`, já que o `db` só é publicado na rede interna do Compose por design) e confirmou que passou. Jose autorizou commit, mesclagem na `main` e push para testar direto no deploy da Vercel. |
| 10/09/2026 | Fatia concluída: commit `1d14940` na branch `codex/fase4-fatia3-banners-configuracoes`, mesclado à `main` em `a07448b`. Antes do merge, descartadas duas edições soltas e não commitadas que já existiam na `main` (`docs/WORKTREE_PREVIEW.md`, `scripts/bootstrap-preview-worktree.mjs`) — Jose confirmou que eram idênticas ao mesmo ajuste do `next-env.d.ts` já trazido pela fatia, sem perda de conteúdo. `lint`, `typecheck`, `npm run test:unit` (245 testes) e `npm run build` repetidos e aprovados na `main` pós-merge, com todas as rotas novas de `/admin/banners` e `/admin/settings` compiladas. `npm run test:db` (45 testes) já havia sido validado de ponta a ponta na worktree isolada antes do merge, contra Postgres real recém-migrado e semeado. Push para `origin/main` concluído (`0ef3385..a07448b`). Aguardando validação de Jose no deploy publicado na Vercel. |
| 10/09/2026 | Validação de Jose no deploy da Vercel: ativar/desativar banner falhava com "Não foi possível alterar a ativação do banner." Causa raiz: o script de build (`prisma generate && next build --webpack`) nunca roda `prisma migrate deploy` — a migration desta fatia (`AuditAction.ACTIVATE`) nunca chegou ao banco de produção Supabase (projeto `fortsul_app`, id `qhttphrfozrwgurnlmni`), embora todas as migrations anteriores estivessem lá. Confirmado via conector Supabase MCP (`list_migrations`, sem tocar em nenhuma credencial) e corrigido aplicando a migration pendente (`apply_migration`: `ALTER TYPE "AuditAction" ADD VALUE 'ACTIVATE'`, aditiva, sem risco de dado) diretamente no banco de produção, com autorização explícita de Jose antes da execução. Confirmado com `execute_sql` que o enum já contém o valor. Automatizar `prisma migrate deploy` no pipeline da Vercel fica registrado como tarefa separada pendente, para essa classe de bug não se repetir em fatias futuras com schema novo. |
| 10/09/2026 | Jose testou ativar/desativar de novo (funcionou) e navegou pelo site público perguntando onde o banner deveria aparecer — a exibição pública ficou fora do escopo da Fatia 3 de propósito (nenhuma tela pública consumia `findActiveBannersPublic()`, já existente desde a Fatia 4.5). Jose decidiu: faixa promocional abaixo do Hero. Proposta técnica registrada em `docs/Proposta_Fase4_Fatia_4_Banners_Publicos.md` (Fase 4, Fatia 4), com um achado adicional: `findActiveBannersPublic()` selecionava `imageKey`/`mimeType`/`size`/`active` — detalhes internos de storage que uma consulta pública nunca deveria expor, mesma categoria de problema que bloqueou a Fatia 4.6 antes do commit, só não pego antes por falta de consumidor público. Jose pediu implementação imediata nesta mesma sessão, numa worktree nova (`claude-fase4-fatia4-banners-publicos`, branch `claude/fase4-fatia4-banners-publicos`), a partir da `main` já atualizada (incluindo o port Node de `bootstrap-local-db.ps1` para `bootstrap-local-db.mjs`, mesclado por outra sessão enquanto esta conversa corria). Implementado: `select` de `findActiveBannersPublic()` restrito a `id`/`title`/`linkUrl`/`imageUrl`/`altText`/`startAt`/`endAt`/`order`; `BannerStrip`/`BannerStripView` (mesmo padrão `ContentSection`/`ContentSectionView`: Server Component assíncrono + view síncrona testável, `try/catch` retornando estado vazio se o banco estiver indisponível na geração); posicionado entre `HeroSection` e `CategoryStrip`; `revalidatePath('/')` adicionado às rotas `activate`/`deactivate`/troca de imagem de banner (mesmo padrão de `publish`/`unpublish` de artigo); dimensão recomendada de imagem (1600×400px, 4:1) adicionada como texto de apoio em `BannerForm`/`BannerImageForm`, decisão conservadora documentada na proposta (§6), sem objeção de Jose ao pedir a implementação. Sem rotação automática — decisão já validada em fatias anteriores (o carrossel de "Novidades e dicas" trocou rotação automática por setas + scroll nativo depois de cortes visuais em testes reais de celular); com 2+ banners ativos, mesma técnica de setas + `scroll-snap`. Varredura pedida por Jose em todas as consultas públicas do sistema: confirmado que só existem 3 funções `*Public()` (`findArticleBySlugPublic`, `listPublishedArticlesPublic`, `findActiveBannersPublic`) e nenhuma página/rota pública toca o Prisma fora delas — as duas de artigo já estavam corretas desde a Fatia 4.6; nenhum outro achado encontrado. `lint`, `typecheck` e `npm run test:unit` (250 testes, 5 novos) aprovados. `npm run build` não pôde ser validado de ponta a ponta nesta worktree nova: `DATABASE_URL` e outras variáveis estão marcadas "Sensitive" no projeto Vercel, então nem `vercel env pull` nem `vercel env run` conseguem trazê-las para nenhum ambiente (nem para Jose) — confirmado ao tentar as duas formas. Jose autorizou seguir sem essa validação local, confiando em lint+typecheck+testes unitários e no próprio build do deploy da Vercel (que tem acesso nativo às variáveis) como validação final. Commit, merge e push autorizados nesta mesma conversa. |
| 10/09/2026 | Fatia concluída: commit `7ca4cc8` na branch `claude/fase4-fatia4-banners-publicos`, mesclado à `main` em `ede4491`. Antes do merge, removidas duas cópias soltas e não commitadas na `main` (`docs/Proposta_Fase4_Fatia_3_Banners_Configuracoes.md`, `docs/Proposta_Fase4_Fatia_4_Banners_Publicos.md`) — conteúdo idêntico ao trazido pelo merge, confirmado por `diff` antes de remover; corrigido de quebra o gap de nunca terem sido versionadas (a proposta da própria Fatia 3 nunca tinha sido commitada, apesar de referenciada neste Plano). `lint`, `typecheck` e `npm run test:unit` (250 testes) repetidos e aprovados na `main` pós-merge. `npm run build` não repetido na `main` pela mesma limitação de variáveis "Sensitive" da Vercel já registrada na entrada anterior — Jose autorizou seguir sem essa validação, confiando no build do próprio deploy. Push para `origin/main` concluído (`4a80342..ede4491`). Aguardando validação de Jose no deploy publicado na Vercel. |
| 11/09/2026 | Confirmado que o banner apareceu no site após recarregar a página (só cache, `revalidatePath('/')` funcionou como esperado) — Fase 4, Fatia 4 encerrada, validada de ponta a ponta em produção. Jose pediu a próxima fatia: CRUD de Produtos e Categorias, com cascata de ativação (categoria desativada esconde produto só naquela categoria; produto pode estar em várias categorias e aparece só nas ativas), exibição pública reaproveitando o padrão de "Novidades e dicas" (setas + popup) e o menu de categorias já existente, exclusão física de produto, depoimentos com links de redes sociais (TikTok/Facebook/Instagram) e botão "Saiba mais" com link `wa.me` e mensagem pré-definida no painel. Proposta técnica registrada em `docs/Proposta_Fase4_Fatia_5_Produtos_Categorias.md`, com 7 decisões de negócio levantadas (§9) — todas respondidas por Jose no mesmo dia e registradas em §10: categoria nasce ativa por padrão; exclusão física de produto confirmada (quebra deliberadamente o padrão "sem exclusão" de `Article`/`Banner`); categoria com produto vinculado mantém bloqueio de exclusão via a restrição já existente no banco; mensagem de WhatsApp customizável por produto (não um texto único global); campo novo `Product.code` inserido manualmente pelo admin (não derivado do nome); limite de 3 depoimentos por produto; catálogo público fica vazio até Jose cadastrar produtos reais (nenhum dado fictício de `solutions-data.ts` migra para o banco). Implementado na mesma sessão, na worktree `claude-fase4-fatia5-produtos-categorias` (branch `claude/fase4-fatia5-produtos-categorias`), a partir da `main` atualizada: migration aditiva (`Category.active`, `Product.code` único, `Product.whatsappMessageTemplate`, model novo `ProductTestimonial` + enum `TestimonialPlatform`, com GRANT para `fortsul_app` seguindo o padrão já usado); repositórios e rotas administrativas completos para categorias (CRUD + ativar/desativar) e produtos (CRUD + ativar/desativar + vínculo de categorias + aplicações/especificações como listas substituíveis + imagens com papel Principal/Galeria + depoimentos com limite de 3), todos com `requireAdminRequest`+`recordAuditEvent` e `revalidatePath('/')`; telas `/admin/categories` e `/admin/products` completas; migração da seção pública "Soluções" de dados estáticos (`solutions-data.ts`) para `listActiveCategoriesPublic()`/`listActiveProductsPublic()` (seleção explícita de campos, mesma correção de vazamento de storage já aplicada em banners), com `SolutionCard` abrindo um popup novo (`ProductDialog`, mesmo padrão de acessibilidade de `ContentArticleDialog`) em vez de linkar para a página estática legada `produto-alimentador.html` (que fica órfã, fora do escopo). `lint`, `typecheck`, `npm run test:unit` (365 testes) e `npm run test:db` (53 testes, contra Postgres real desta worktree, incluindo um teste de integração novo para a cascata categoria/produto e a correção de uma asserção pré-existente frágil em `fatia-4-1.integration.test.ts` que assumia que a tabela `categories` só teria as 6 categorias oficiais) aprovados. `npm run build` não validado de ponta a ponta nesta worktree pela mesma limitação de variáveis "Sensitive" da Vercel já aceita na fatia anterior. `scope-gate-reviewer` (aprovado, dentro do escopo) e `ui-reviewer` (sem bloqueador; 5 ajustes de acessibilidade/consistência aplicados: área de toque do botão "Remover imagem", `required` no texto alternativo, import da constante `MAX_PRODUCT_TESTIMONIALS` em vez de redeclarar o limite, `aria-label` único por depoimento, alinhamento do botão "Remover" de especificação no mobile; nota desatualizada do `AdminSidebar` em `docs/COMPONENTS.md` corrigida) acionados antes do commit. Commit `0343370` na branch `claude/fase4-fatia5-produtos-categorias`, mesclado à `main` em `2b83cad`. `lint`, `typecheck` e `npm run test:unit` (365 testes) repetidos e aprovados na `main` pós-merge. Push para `origin/main` concluído (`a1ed137..2b83cad`). **Pendência conhecida a resolver antes do teste de Jose na Vercel**: esta fatia trouxe uma migration nova (`20260911040000_fase4_fatia5_produtos_categorias`) que, pelo mesmo motivo já registrado na Fatia 4 (build da Vercel não roda `prisma migrate deploy`), provavelmente ainda não foi aplicada no Supabase de produção — tentativa de aplicar via conector Supabase MCP falhou por instabilidade transitória do conector nesta sessão; precisa ser tentada de novo antes de qualquer teste de produto/categoria no deploy. |
| 11/09/2026 | Jose aplicou a migration `20260911040000_fase4_fatia5_produtos_categorias` direto no SQL Editor do Supabase. O próprio Supabase alertou, antes de rodar, que a `CREATE TABLE "product_testimonials"` ficaria sem Row Level Security — Claude identificou que clicar em "Run and enable RLS" (oferecido pelo próprio Supabase) habilitaria RLS **sem política**, bloqueando totalmente o acesso da role de runtime `fortsul_app` e quebrando a funcionalidade de depoimentos. Corrigido o arquivo da migration, acrescentando `ENABLE ROW LEVEL SECURITY` + `FORCE` + `CREATE POLICY` para `fortsul_app`, mesmo padrão já usado na Fatia 4.3 para `admin_users`/`login_attempts`/`audit_logs`/`partner_private`. Commit `3bf860d` direto na `main` (correção pequena e corretiva de segurança, mesmo padrão de exceção pontual já usado nesta sessão) e push. Jose rodou o SQL corrigido com sucesso. |
| 11/09/2026 | A pedido de Jose, verificação nos logs/advisors do Supabase revelou um achado muito mais amplo: **18 tabelas do schema público nunca tiveram RLS habilitado desde a criação do projeto** (05/09/2026) — incluindo `partners`, `products`, `categories`, `banners`, `articles`, `institutional_settings` e até `_prisma_migrations`. As roles `anon`/`authenticated` do Supabase tinham SELECT/INSERT/UPDATE/DELETE/TRUNCATE liberados por padrão nelas via PostgREST desde sempre — qualquer requisição com a chave pública `anon` conseguia ler ou alterar esses dados diretamente, contornando toda a aplicação. Confirmado que a role `postgres` (usada em migrations/seed, local e produção) tem `rolbypassrls=true`, então corrigir isso não afeta nenhum fluxo existente. Com aprovação explícita de Jose, criada e aplicada a migration `20260911120000_security_hardening_rls_all_tables` (RLS + FORCE + política permissiva para `fortsul_app` nas 17 tabelas de dados; RLS sem política — deny-all — em `_prisma_migrations`, que nenhuma role de runtime deveria tocar). Aplicada em produção via Supabase MCP e confirmada no advisor (0 tabelas com RLS ausente, 25 políticas ativas no total). Commit `055bea2` na `main`, push concluído. |
| 11/09/2026 | Jose testou manualmente o site e registrou 5 pontos de melhoria na Fase 4/Fatia 5 (produtos): (1) o link `wa.me` do botão "Saiba mais" deveria incluir o link do próprio produto, não só o texto pré-definido; (2) faltava informar no painel a resolução recomendada das imagens da galeria; (3) faltava informar no painel a quantidade máxima de imagens por produto; (4) especificações precisavam de atalhos para altura/largura/comprimento/peso (material técnico descartado pelo próprio Jose — já cabe nos campos livres existentes); (5) ícone da rede social ao lado do link de cada depoimento no popup público. Implementado nesta mesma sessão: `?produto=<slug>` como deep link da home (a URL do site acompanha o produto aberto no popup, e esse link entra na mensagem do WhatsApp via `appendProductUrlToWhatsAppLink`); `PRODUCT_IMAGE_RECOMMENDED_WIDTH_PX`/`HEIGHT_PX` (1600×900px, 16:9, mesma proporção do carrossel do popup) e `MAX_PRODUCT_IMAGES` (6, mesmo padrão de `MAX_ARTICLE_IMAGES`) em `product-image-input.ts`, exibidos e agora impostos no upload; atalhos de especificação em `ProductSpecificationsForm`; ícones inline de TikTok/Facebook/Instagram em `ProductDialog`. `lint`, `typecheck`, `npm run test:unit` (376 testes) e `npm run test:db` (53 testes) aprovados. Commit `6ee1c39` na `main`, push concluído. |
| 11/09/2026 | **Incidente encontrado durante a validação acima**: o `.env.local` deste checkout tinha um `DATABASE_URL` apontando direto para o pooler do Supabase de produção (deixado de uma sessão anterior de diagnóstico via Supabase MCP) — como `vitest.setup.ts` carrega `.env.local` antes de `.env`, os dois primeiros `npm run test:db` desta sessão rodaram de verdade contra produção, e uma consulta confirmou ~35 linhas de teste já acumuladas lá (categorias, regiões, estados, municípios, parceiros, área comercial, todas com nomes claramente de teste — nenhum dado real afetado). Com aprovação explícita de Jose, os registros de teste foram apagados em produção via Supabase MCP (`execute_sql`, por ID exato, nunca por padrão amplo) e confirmados removidos; Jose comentou as linhas de `DATABASE_URL` no `.env.local`. Lição registrada em `docs/WORKTREE_PREVIEW.md` (tabela de falhas recorrentes): `test:db` só deve rodar via `node scripts/bootstrap-local-db.mjs --RunDbTests`, que injeta a URL do Postgres local dentro da rede do Compose e ignora `.env.local` por completo — nunca direto no host. Um `grep` de verificação do Claude expôs sem querer a senha do Postgres de produção em texto puro na saída do terminal; rotação dessa senha (Supabase → Project Settings → Database → Reset database password) recomendada a Jose e ainda pendente da parte dele. |
| 11/09/2026 | Jose reportou achado de segurança grave: deixou uma sessão aberta por mais de 10 minutos, um novo deploy aconteceu, e um simples recarregar de página não pediu login de novo. Investigação (agente Explore) confirmou que **não era bug**: o login usa Auth.js (NextAuth v5) com sessão em JWT de 8h (`src/lib/auth/config.ts`), sem nenhum timeout por inatividade — 10 minutos está bem dentro dessa janela. Um redeploy não troca `AUTH_SECRET` do mesmo projeto Vercel, então tokens já emitidos continuam válidos após deploy, comportamento padrão de qualquer app com sessão JWT (não é uma falha a corrigir por si só). Apresentado o achado tecnicamente a Jose, que aprovou explicitamente: reduzir a sessão de 8h para 2h absolutas e adicionar logout automático após 15 min de inatividade. Implementado: `maxAge` de `src/lib/auth/config.ts` reduzido para `60 * 60 * 2`; novo componente `IdleLogoutWatcher` (`src/components/admin/IdleLogoutWatcher.tsx`) monitora atividade (mouse/teclado/toque/scroll) e chama a mesma rota `/api/admin/logout` já usada pelo `LogoutButton` após 15 min sem interação; montado em `src/app/admin/(dashboard)/layout.tsx`, que já protege todas as rotas reais do painel. `scope-gate-reviewer` aprovado dentro do escopo (não cria backend/CRUD/auth novos, só ajusta parâmetro existente e reaproveita rota já protegida por `isSameOriginRequest`), mas encontrou uma lacuna: `/admin/session-check`, um artefato de teste da Fatia 4.3 que também exigia login, ficava fora do layout protegido e por isso não recebia o novo controle. Jose optou por remover essa página (já obsoleta desde que o painel real da Fase 4 existe) em vez de proteger os dois caminhos separadamente. `lint`, `typecheck`, `npm run test:unit` (376 testes, 4 novos para o `IdleLogoutWatcher`) e `npm run test:db` (53 testes, via `node scripts/bootstrap-local-db.mjs --RunDbTests`) aprovados. |
| 11/09/2026 | Jose reportou corte de imagem nos cards da seção "Soluções": gerou as imagens já na resolução recomendada (1600×900px, 16:9) e elas aparecem corretas no popup, mas o card da capa cortava a imagem (o selo de qualidade no canto ficava parcialmente cortado). Causa: `.card-media` em `globals.css` usava altura fixa em pixels (285px, com overrides de 360/400/270px por breakpoint) com largura fluida — como a proporção real da caixa varia com a largura do card, raramente batia com a proporção da imagem, e `object-fit: cover` cortava a diferença. Corrigido trocando a altura fixa por `aspect-ratio: 16 / 9` (mesma proporção da imagem recomendada e do carrossel do popup), eliminando as 3 regras de altura fixa por breakpoint — a proporção agora bate exatamente em qualquer largura de card, então `cover` deixa de cortar. Também removidas 2 regras mortas de `.featured` (variante de card de uma versão estática anterior à Fatia 5, nunca aplicada no carrossel atual). Verificado visualmente com página de teste isolada (grade de 3 colunas e coluna única de 340px, imagem sintética com marcador no canto) confirmando corte zero nas duas larguras; `lint`/`typecheck` aprovados (mudança é só CSS, sem lógica de componente para testar). |
| 11/09/2026 | Jose pediu limite de caracteres nos campos de texto de Produtos e Artigos, com contador visível em cada campo, para manter o padrão dos cards e a navegação responsiva (nenhum card tem truncamento visual hoje — texto longo simplesmente estica a altura e quebra o ritmo da grade). Levantamento (agente Explore) confirmou: nenhum campo tinha limite algum, nem no formulário nem no banco (todas as colunas são `text` sem tamanho fixo), e não havia precedente de contador de caracteres no painel. Apresentados limites propostos por campo (nome/eyebrow/descrição de produto e artigo, aplicações, especificações, autor de depoimento, nome de categoria) e aprovados por Jose sem ajuste. Implementado: `src/lib/content/text-limits.ts` como fonte única dos limites (reaproveitada por client e servidor); `CharCounter` (`src/components/admin/CharCounter.tsx`) reutilizado em `ProductForm`, `ArticleTextForm`, `CategoryForm`, `ProductApplicationsForm`, `ProductSpecificationsForm` e `ProductTestimonialsForm` — cada campo com `maxLength` no input e validação espelhada no servidor (`product-input.ts`, `category-input.ts`, `testimonial-input.ts`, e o novo `article-input.ts`, que também elimina a duplicação de validação que existia entre as duas rotas de artigo). Nenhuma migration necessária (limite é só de UI/validação). `lint`, `typecheck` e `npm run test:unit` (393 testes, 17 novos) aprovados; `npm run test:db` (53 testes, via `node scripts/bootstrap-local-db.mjs --RunDbTests`) confirmando que nada na camada de banco foi afetado. |

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
