# PLANO MESTRE DE CONTROLE — PROJETO FORTSULSC

> Documento de contexto, governança técnica e execução por fases para qualquer agente (Claude, Codex ou outro) que trabalhar neste projeto.
>
> **Projeto:** FortSulSC — reformulação do site institucional/catálogo da FortSul Equipamentos Agrícolas
> **Stack esperada (fase full stack futura):** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma, Auth.js, Leaflet + OpenStreetMap
> **Estado atual do código:** frontend estático (`index.html`, `styles.css`, `script.js`), sem backend, sem banco, sem autenticação
> **Abordagem:** modernização incremental de um site já existente, protótipo visual já aprovado pelo cliente, com implementação por portões de aprovação — design/frontend primeiro, backend somente após aprovação explícita do Jose
> **Data de consolidação:** 21 de agosto de 2026

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

A execução autorizada, nesta data, está na **Fase 1 — Design/frontend**, concluindo os itens ainda pendentes sobre o protótipo estático já existente. A Fase 2 (estrutura Next.js) segue não autorizada até a Fase 1 ser formalmente aprovada pelo Jose.

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

Status consolidado em 21 de agosto de 2026:

| Status | Etapa | Situação atual | Próximo portão |
|---|---|---|---|
| 🟡 | Item de segurança — arquivo `recovery-codes-vercel-fortsul.txt` | Jose removeu o arquivo do repositório em 21/08/2026. | Confirmar ainda: (a) se o arquivo chegou a ser commitado antes da remoção — se sim, precisa ser purgado do histórico do Git, não só apagado no working tree; (b) se os códigos de recuperação foram revogados/regenerados na Vercel, já que um arquivo removido do diretório continua exposto se algum dia esteve em um commit publicado. Enquanto (a) e (b) não forem confirmados, tratar como parcialmente resolvido, não encerrado. |
| 🟢 | Fase 0 — Planejamento e validação | `PLANEJAMENTO_PROJETO.md`, `ARCHITECTURE.md`, `API.md`, `COMPONENTS.md`, `DESIGN-SYSTEM.md`, `RULES.md` e `CHECKLIST.md` criados e revisados. Revisão técnica externa realizada. | Nenhum; etapa concluída, mantida como referência viva. |
| 🟡 | Fase 1 — Design/frontend aprovado | Existe um frontend estático funcional (`index.html`, `styles.css`, `script.js`) cobrindo home, categorias, seção institucional, suporte, representantes (lista) e rodapé. Design tokens já documentados em `DESIGN-SYSTEM.md`. Ainda não migrado para componentes, ainda não passou por revisão visual final com o Jose, ainda não tem página de produto individual nem experiência de mapa. | Confirmar com o Jose: (a) modernizações visuais propostas, (b) decisão sobre Blog, (c) decisão sobre Revendas, antes de considerar a Fase 1 concluída. |
| 🔴 | Fase 2 — Estrutura Next.js | Não iniciada. Estrutura de pastas já esboçada em `ARCHITECTURE.md` como referência, não implementada. | Aprovação da Fase 1 (design/frontend) pelo Jose. |
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

## Fase 1 — Design/frontend aprovado 🟡

Objetivo: transformar o protótipo aprovado em frontend moderno e responsivo, sem banco, sem autenticação, sem CRUD.

Já existe:
- home, categorias, seção institucional, suporte, representantes (lista), rodapé, menu mobile, CTA WhatsApp fixo.

Falta para considerar concluída:
- página de produto individual com estrutura comercial completa (imagens, aplicações, benefícios, especificações);
- revisão visual final com o Jose das modernizações propostas (contraste, espaçamento, hierarquia);
- decisão sobre Blog e Revendas refletida na navegação;
- página 404, `robots.txt`, meta descriptions por página;
- Lighthouse ≥ 90 em performance e acessibilidade;
- teste cross-browser (Chrome, Safari, Firefox).

Não incluir nesta fase: banco, autenticação, CRUD, regras de negócio, mapa interativo com dados dinâmicos.

## Fase 2 — Estrutura Next.js 🔴

Objetivo: migrar o frontend aprovado para base Next.js + TypeScript, seguindo a estrutura de pastas de `ARCHITECTURE.md`.

Importante: a pasta `app/api/` nasce vazia/placeholder nesta fase — não implica API funcional. Rotas de "Revendas" só devem ser criadas se a Parte III já tiver sido respondida.

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

---

# PARTE V — DEFINIÇÃO DE PRONTO DESTE DOCUMENTO

Um agente entendeu este Plano Mestre quando consegue:

- explicar por que o projeto começa pelo frontend e não pelo banco, neste caso específico;
- identificar em qual fase o projeto está agora (Fase 1, parcial) sem precisar perguntar;
- citar o item de segurança do recovery codes e seu status atual (parcialmente resolvido) antes de qualquer commit;
- listar as perguntas pendentes do Jose que bloqueiam a Fase 3;
- diferenciar o que já existe (frontend estático) do que é apenas planejado (Next.js, Prisma, painel admin, Docker);
- não iniciar a Fase 2 sem a Fase 1 estar revisada, não iniciar a Fase Docker sem a Fase 2 aprovada, e não iniciar a Fase 3 sem aprovação explícita;
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

---

# PARTE VII — INSTRUÇÃO DE INÍCIO PARA O AGENTE

## Tarefa autorizada agora: concluir a Fase 1 — Design/frontend

> Copie o bloco abaixo para o agente (Claude, Codex ou outro) que for continuar o projeto.

```text
Leia integralmente PLANO_MESTRE_FORTSULSC.md antes de qualquer ação.
Leia também docs/PLANEJAMENTO_PROJETO.md, docs/RULES.md, docs/CHECKLIST.md
e docs/DESIGN-SYSTEM.md.

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
