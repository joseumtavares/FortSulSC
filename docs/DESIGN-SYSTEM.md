# Design System — FortSulSC

Status: design system inicial baseado no frontend atual
Última revisão: 2026-08-21

> **Governança:** o status vigente da Fase 1 (design/frontend) está em `PLANO_MESTRE_FORTSULSC.md`. Modernizações visuais aqui descritas continuam dependendo de apresentação e aprovação do Jose antes de implementação.

## 1. Princípio visual

O design deve preservar o padrão aprovado pelo cliente e a identidade visual da FortSulSC. Modernizações são permitidas apenas como refinamento: melhor espaçamento, hierarquia, responsividade, contraste e consistência.

Não alterar drasticamente a linguagem visual sem apresentar antes ao Jose.

## 2. Cores

Tokens atuais definidos em `styles.css`:

| Token | Valor | Uso |
|---|---|---|
| `--blue-950` | `#061b42` | fundos escuros, hero, footer |
| `--blue-900` | `#08285e` | títulos, seções institucionais, fundos |
| `--blue-800` | `#0a3478` | botões escuros, links, destaques |
| `--blue-700` | `#0d4ba5` | ícones e acentos azuis |
| `--orange` | `#f26a21` | CTA principal e destaques |
| `--orange-light` | `#ff8a3d` | hover e detalhes claros |
| `--ink` | `#152033` | texto principal |
| `--muted` | `#667085` | texto secundário |
| `--surface` | `#f4f6f8` | fundos neutros |
| `--white` | `#ffffff` | fundo e texto sobre cor |
| `--line` | `#dfe4ea` | bordas discretas |

Regra:

- laranja deve ser reservado para ação/destaque;
- azul deve comunicar solidez, tecnologia e confiança;
- fundos neutros devem dar respiro aos produtos.

## 3. Tipografia

Fonte atual:

```css
"Segoe UI", Inter, Arial, sans-serif
```

Escala atual:

- corpo: `16px`, `line-height: 1.6`;
- parágrafo destacado: `18px`;
- `h1`: `clamp(48px, 5.3vw, 74px)`;
- `h2`: `clamp(38px, 4.3vw, 58px)`;
- cards: aproximadamente `18px` a `20px`.

Regras:

- títulos devem ser fortes e compactos;
- textos longos devem usar cor `--muted`;
- evitar parágrafos extensos em cards;
- manter boa leitura no mobile.

## 4. Espaçamentos

Tokens e padrões atuais:

- container: `min(1180px, calc(100% - 48px))`;
- seções desktop: `115px` no eixo vertical;
- seções tablet: `88px`;
- seções mobile: entre `70px` e `88px`;
- gaps principais: `50px` a `110px`;
- gaps de cards: `18px`;
- padding de cards: `19px` a `24px`.

Regra:

- preservar respiro visual;
- evitar seções grudadas;
- reduzir espaçamentos no mobile sem perder hierarquia.

## 5. Border radius

Token atual:

```css
--radius: 18px;
```

No mobile:

```css
--radius: 14px;
```

Usos:

- cards;
- blocos de conteúdo;
- elementos destacados.

Botões usam radius menor, próximo de `7px`, para manter aparência técnica e robusta.

## 6. Sombras

Token atual:

```css
--shadow: 0 24px 70px rgba(6, 27, 66, 0.14);
```

Regras:

- usar sombras com moderação;
- preferir sombra para elementos flutuantes, cards em destaque e navegação sticky;
- não usar sombra pesada em todos os blocos.

## 7. Grid

Padrões atuais:

- container centralizado;
- home com grids de 2 colunas no desktop;
- soluções com grid assimétrico;
- suporte com 4 colunas no desktop;
- footer com 4 colunas.

Responsividade:

- desktop: múltiplas colunas;
- tablet: 2 colunas;
- mobile: 1 coluna.

## 8. Breakpoints

Breakpoints atuais:

```css
1050px
820px
560px
```

Uso:

- `1050px`: ajuste de navegação, hero e grids;
- `820px`: menu mobile, grids em coluna, redução de seções;
- `560px`: layout mobile completo.

## 9. Botões

Classe base atual:

```css
.button
```

Características:

- altura mínima: `54px`;
- fundo laranja;
- texto branco;
- peso forte;
- hover com leve elevação;
- ícone de seta opcional.

Variações atuais:

- `.button-sm`;
- `.button-dark`;
- `.button-light`.

Regras:

- CTA principal deve usar laranja;
- CTA secundário pode usar azul ou link textual;
- no mobile, CTAs principais podem ocupar largura total.

## 10. Abas institucionais

O padrão `AboutTabs` representa seções de conteúdo mutuamente exclusivo em formato de fichário.

- a aba ativa usa fundo branco, borda superior laranja e sombra sutil para criar profundidade;
- abas inativas usam `--surface` e preservam foco visível do navegador;
- os painéis usam transição curta de opacidade e deslocamento, desativada para `prefers-reduced-motion`;
- abaixo de `560px`, as seis abas formam uma grade de duas colunas, sem rolagem horizontal.

Use esse padrão somente quando uma única seção de conteúdo deve estar ativa por vez. Filtros combináveis continuam usando botões com `aria-pressed`.

## 11. Inputs

Status: não implementado.

Quando formulários forem aprovados:

- labels sempre visíveis;
- mensagens de erro claras;
- foco com contorno acessível;
- validação no servidor;
- nunca depender apenas de placeholder.

## 12. Cards

Cards atuais:

- `solution-card`;
- `card-media`;
- `card-body`;
- `card-tag`.

Regras:

- imagem forte no topo;
- título claro;
- categoria/destaque em laranja;
- CTA pequeno e consistente;
- hover sutil, sem exagero.

## 13. Modais

Status: implementado. Dois modais reais no site público, ambos usando
`<dialog>` nativo com o mesmo padrão de acessibilidade:

- `WhatsAppDialog` (`src/components/whatsapp/WhatsAppDialog.tsx`) — opções de contato via WhatsApp;
- `ContentArticleDialog` (`src/components/content/ContentArticleDialog.tsx`) — texto completo e galeria de imagens de um artigo de "Novidades e dicas".

Só criar modal se houver necessidade real. Preferir páginas, drawers ou seções simples quando possível.

Padrão obrigatório, seguido pelos dois modais acima:

- fechar com ESC;
- foco preso dentro do modal (Tab/Shift+Tab não escapam);
- foco vai para o botão de fechar ao abrir;
- botão de fechar acessível (`aria-label`);
- clique fora do conteúdo (no overlay) fecha o modal;
- overlay discreto (`::backdrop` com blur leve);
- `body.dialog-open { overflow: hidden }` enquanto aberto.

## 14. Tabelas

Status: planejadas apenas para dashboard futuro.

Quando o admin for aprovado:

- cabeçalho fixo quando útil;
- ações por linha;
- busca e filtros claros;
- estados vazio/carregando/erro;
- paginação quando houver volume.

## 15. Estados

Estados atuais:

- hover em botões;
- hover em links;
- menu aberto;
- filtro ativo;
- card oculto;
- reveal animation.

Estados obrigatórios futuros:

- hover;
- focus visible;
- active;
- disabled;
- loading;
- empty;
- error.

## 16. Ícones

Ícones atuais são SVG inline.

Regras:

- ícone não substitui texto essencial;
- SVG decorativo deve usar `aria-hidden="true"`;
- ícone funcional deve ter label acessível;
- manter traço simples e consistente.

## 17. Regras de responsividade

- testar em desktop, tablet e celular;
- menu mobile deve ser simples;
- CTA principal deve permanecer fácil de tocar;
- evitar textos muito longos em cards;
- imagens devem manter proporção e bom corte;
- respeitar `prefers-reduced-motion`.

## 18. Como criar novos componentes mantendo consistência

1. usar tokens existentes antes de criar novos;
2. verificar se já existe componente parecido;
3. manter variações pequenas;
4. documentar novo componente em `docs/COMPONENTS.md`;
5. preservar a paleta FortSulSC;
6. validar alterações visuais relevantes com o Jose.
