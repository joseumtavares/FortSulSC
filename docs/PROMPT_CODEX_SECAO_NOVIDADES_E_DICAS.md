# Prompt Codex — Seção "Novidades e dicas"

**Status:** aprovado para implementação com conteúdo de teste — ver seção "Natureza do conteúdo abaixo" antes de executar.
**Escopo:** Fase 1/2 (frontend). A estrutura visual é fixa, com 3 cards. A
edição pelo painel administrativo é decisão de arquitetura já aprovada, mas
sua implementação pertence à Fase 3 — não crie painel, API ou persistência
agora.
**Fonte de verdade de governança:** `docs/PLANO_MESTRE_FORTSULSC.md`.

## Natureza do conteúdo abaixo — leia antes de implementar

O bloco "Conteúdo aprovado" desta versão contém **conteúdo de teste/exemplo**,
autorizado explicitamente pelo José especificamente para validar layout e
estrutura desta seção nesta fase. **Não é conteúdo de lançamento.** Isso é uma
exceção pontual à regra geral do projeto de nunca inventar conteúdo — a
exceção está documentada aqui e não deve ser usada como precedente para
outras seções.

Requisitos obrigatórios de implementação por causa disso:

1. Nesta versão do frontend estático, os dados dos 3 cards devem permanecer
   concentrados no bloco HTML delimitado por `<ul class="content-grid">`.
   Não renderizar os cards em JavaScript, não usar `innerHTML` e não alterar
   `script.js`. A troca futura pelo conteúdo de lançamento deverá substituir
   somente esse bloco, preservando a estrutura visual.
2. Colocar imediatamente acima dos três cards o comentário HTML:
   `<!-- TESTE — conteúdo de exemplo aprovado para validação de layout, substituir antes do lançamento -->`.
3. Registrar este item como pendência aberta em `docs/PLANO_MESTRE_FORTSULSC.md`
   (ou documento de status equivalente): a Fase 1/2 não pode ser declarada
   concluída com este conteúdo de teste ainda em produção.

## Contexto confirmado

O frontend estático atual contém hero, categorias, seção institucional,
soluções, atendimento, presença, CTA e rodapé. A seção "Novidades e dicas"
substitui/renomeia o que era referenciado anteriormente como "Conteúdos e
dicas" em `docs/PLANEJAMENTO_PROJETO.md` (item 10) e no Incremento 7 do plano
de migração da Fase 2 — é a mesma funcionalidade, não uma seção adicional.
Ambos os documentos serão atualizados para refletir o nome definitivo.

## Prompt para execução

```text
Leia integralmente `docs/PLANO_MESTRE_FORTSULSC.md`,
`docs/PLANEJAMENTO_PROJETO.md`, `docs/RULES.md`, `docs/CHECKLIST.md`,
`docs/DESIGN-SYSTEM.md` e `docs/COMPONENTS.md` antes de propor qualquer
alteração.

Consulte o SecondBrain, use os skills aplicáveis e confira o estado real do
repositório. Preserve todas as alterações preexistentes. Não faça commit,
push, stash, reset, restore, clean, branch, worktree ou outra operação Git
sem autorização explícita do José.

Você está autorizado a implementar a seção "Novidades e dicas" com o
conteúdo de teste definido no bloco "Conteúdo aprovado" abaixo, seguindo
exatamente os requisitos da seção "Natureza do conteúdo abaixo" (dados
isolados, comentário TESTE, pendência registrada).

Antes de qualquer coisa, use exatamente o rótulo de CTA comercial já
confirmado no `index.html` atual para o CTA final: **"Falar com a FortSul"**.
Esta é a confirmação definitiva — não é mais necessário verificar novamente.

Use exatamente os textos, imagens e ausência de link definidos no bloco
"Conteúdo aprovado". Não adicione destino/link a nenhum card — os três
permanecem sem link nesta fase, conforme aprovado.

Preserve a linguagem visual da FortSul: tokens já definidos, HTML semântico,
acessibilidade, foco visível, `prefers-reduced-motion` e os breakpoints de
1050 px, 820 px e 560 px.

Antes da implementação, apresente: (1) arquivos que serão alterados;
(2) estrutura semântica proposta; (3) tratamento de imagens, incluindo alt e
responsividade; e (4) diff proposto. Aguarde a aprovação do José e a revisão
do Claude.

Após a implementação autorizada, execute `npm test`, `node --check preview.mjs`,
`node --check script.js`, `node --check test-preview.mjs` e `git diff --check`.
Abra a home e valide a seção em 1050 px, 820 px e 560 px. Entregue também uma
lista curta de testes manuais para o José. Não declare a Fase 1 ou a Fase 2
concluída enquanto este conteúdo permanecer como teste.
```

## Conteúdo aprovado

### Posicionamento e título da seção

| Campo | Valor |
|---|---|
| Posição na home | Entre **Presença** e **CTA final** *(proposta do Claude, sem objeção registrada — ajustável a qualquer momento)* |
| `id`/âncora | `#novidades-e-dicas` |
| Eyebrow | **Dicas FortSul** *(proposta do Claude, sem objeção registrada — ajustável)* |
| Título (`h2`) | **Novidades e dicas** |
| Texto de apoio | Informações e dicas para ajudar você a conhecer melhor os equipamentos e soluções da FortSul. |
| CTA geral (rótulo e destino) | Rótulo: **"Falar com a FortSul"** (confirmado, igual ao CTA final do site). Destino: WhatsApp (48) 3660-0818 |

### Cards — conteúdo de teste (não é conteúdo de lançamento)

| Ordem | Título | Resumo | Imagem | Alt | Destino | CTA |
|---:|---|---|---|---|---|---|
| 1 | Como escolher o alimentador ideal | Dicas para dimensionar o alimentador certo para o seu processo. | `image/alimentador-reto-banner1.webp` | Alimentador de cavaco, briquete e pellets em operação | Sem link (teste) | — |
| 2 | Cuidados com queimadores industriais | Boas práticas de manutenção para prolongar a vida útil do equipamento. | `image/queimador.webp` | Queimador industrial FortSul | Sem link (teste) | — |
| 3 | FortSul em todo o Brasil | Conheça a rede de representantes da FortSul nos estados ativos. | `image/FrtSulSC_Mapa-Representantes-Estados-Ativos.webp` | Mapa de representantes da FortSul por estado | Sem link (teste) | — |

Reaproveitamento de imagens já existentes com novo significado, autorizado
explicitamente para este uso de teste.

## Critérios de aceitação

- A seção possui exatamente 3 cards, mesmo formato visual, na ordem da
  tabela acima.
- Dados dos cards permanecem concentrados no bloco HTML delimitado por
  `<ul class="content-grid">`, sem renderização em JavaScript, sem
  `innerHTML` e com o comentário HTML `<!-- TESTE ... -->` imediatamente
  acima dos três cards.
- Não há CMS editorial de Artigos, API, painel ou persistência.
- Marcação usa seção nomeada, `h2`, estrutura de cards semântica.
- Imagens com `alt` descritivo (nenhuma é decorativa aqui).
- Funciona em desktop, tablet e celular nos breakpoints existentes.
- "Novidades e dicas" aparece no menu principal.
- Frontend estático, links e CTAs existentes continuam funcionais.
- Pendência de substituição do conteúdo de teste está registrada em
  documento de status antes do incremento ser considerado concluído.

## Evidências exigidas na entrega

- Resultado de `npm test`.
- Resultado dos três comandos `node --check`.
- Resultado de `git diff --check`.
- Lista dos arquivos efetivamente alterados.
- Verificação em 1050 px, 820 px e 560 px.
- Lista de testes manuais para revisão visual do José.
- Confirmação explícita de que o texto do CTA está alinhado ao padrão
  existente no site: **"Falar com a FortSul"**, já verificado nesta versão.

## Decisões já aprovadas (histórico consolidado)

- Nome público definitivo: **Novidades e dicas** (substitui "Conteúdos e
  dicas" em toda a documentação).
- Exatamente 3 cards fixos, mesmo formato visual.
- Cada card: título, resumo, imagem e destino opcional — administráveis pelo
  painel **na Fase 3**; hardcoded como dado isolado nesta fase.
- Sem data nem categoria exibida nos cards.
- Seção aparece no menu principal — resolve a pendência antiga de "decisão
  sobre Blog na navegação" registrada em `PROMPT_COMUNICACAO_AGENTES.md`.
- Distinta do CMS de Artigos (Fase 3).
- CTA, se usado, aponta para WhatsApp (48) 3660-0818 com rótulo **"Falar com
  a FortSul"** (confirmado pelo Codex como o padrão já usado no CTA final do
  site).
- Conteúdo dos 3 cards nesta versão é de teste, aprovado especificamente
  para validação de layout — ver seção "Natureza do conteúdo abaixo".
