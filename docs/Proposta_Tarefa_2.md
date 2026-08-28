# Proposta — Tarefa 2: Disponibilizar assets em `public/` sem remover o baseline estático

Status: IMPLEMENTADA — AGUARDANDO APROVAÇÃO DUPLA/COMMIT
Data: 27/08/2026
Escopo autorizado: somente Tarefa 2, conforme `tasks/plan.md` e `tasks/todo.md`
Savepoint confirmado: commit `160eb38` ("feat: criar estrutura minima do App Router (Tarefa 1B)")

## 1. Estratégia aprovada

Criar `public/image/` e copiar, sem conversão, os 15 arquivos WebP já usados pelo baseline estático, espelhando os caminhos relativos de `image/`. Assets em `public/` são servidos a partir da raiz da aplicação Next.js e podem ser referenciados por caminho absoluto (`/image/...`) em `<img>` ou `next/image` — confirmado em `docs/01-app/03-api-reference/03-file-conventions/public-folder.mdx` (Context7, tag `/vercel/next.js/v16.2.9`).

## 2. Arquivos copiados (15)

| Origem (`image/`) | Destino (`public/image/`) |
|---|---|
| `cropped-favicon.webp` | idem |
| `cropped-Logo.webp` | idem |
| `alimentador-reto-fundo-plantacao.webp` | idem |
| `alimentador-reto-fundo-plantacao-1200.webp` | idem |
| `alimentador-reto-fundo-plantacao-768.webp` | idem |
| `alimentador-reto.webp` | idem |
| `queimador.webp` | idem |
| `Pesquisa/cavaco-640.webp` | idem |
| `Pesquisa/pellets-640.webp` | idem |
| `FrtSulSC_Mapa-Representantes-Estados-Ativos.webp` | idem |
| `alimentador-reto-banner1.webp` | idem |
| `alimentador-reto-banner1-640.webp` | idem |
| `alimentador-reto-banner1-960.webp` | idem |
| `alimentador-reto-banner2-480.webp` | idem |
| `alimentador-reto-banner-cell-360.webp` | idem |

Total: 1,3 MB (1.311.282 bytes).

## 3. Explicitamente fora do escopo

- PNG/JPEG legados e originais de alta resolução (não referenciados pelo Next.js nesta fase).
- `banner2-1.webp`, `banner3-2.webp`, `alimentador-reto (1).webp` e `alimentador-reto-banner-cell.webp` — confirmados sem nenhuma referência no baseline (`index.html`, `produto-alimentador.html`, `404.html`, `styles.css`, `script.js`).
- Nenhuma alteração em `image/`, HTML/CSS/JS estáticos, componentes Next.js, metadados ou favicon de rota.

Total de arquivos legados/não referenciados deixados de fora: **~13 MB** (13.412.691 bytes — número corrigido nesta revisão; a proposta original citava "~9 MB").

## 4. Revisão técnica do Claude (antes da implementação)

- Os 15 nomes/caminhos foram conferidos um a um contra o `image/` real e contra todo `src=`/`srcset=`/`href=`/`url()` do baseline — inclusive o typo pré-existente `FrtSulSC_...` (não "FortSulSC") e a capitalização `Pesquisa/`, ambos corretos na proposta.
- `styles.css` não tem nenhuma referência a `image/`.
- `404.html` referencia `cropped-favicon.webp` e `cropped-Logo.webp` via caminho absoluto (`/image/...`) — já cobertos pela lista.
- Escopo bate exatamente com os critérios da Tarefa 2 em `tasks/plan.md`. Nenhuma regra de negócio, backend ou componente Next.js criado.

## 5. Validações executadas

| Validação | Resultado |
|---|---|
| Hash SHA-256 + tamanho, origem × destino, para os 15 arquivos | OK — idênticos em todos |
| `git status`/`git diff` em `image/` | Vazio — `image/` permanece byte a byte inalterado |
| `npm run typecheck` | OK, sem erro |
| `npm run build` | OK, sem erro |
| `npm test` | OK — suíte do preview estático continua verde |
| `npm run dev` + `GET /image/<cada um dos 15>` | Ver seção 6 |

## 6. Smoke HTTP dos 15 arquivos via `next dev`

`npm run dev` subiu em `http://localhost:3000`; todas as 15 URLs `/image/...` responderam **HTTP 200** com **`Content-Type: image/webp`**, sem exceção:

```text
OK  /image/cropped-favicon.webp
OK  /image/cropped-Logo.webp
OK  /image/alimentador-reto-fundo-plantacao.webp
OK  /image/alimentador-reto-fundo-plantacao-1200.webp
OK  /image/alimentador-reto-fundo-plantacao-768.webp
OK  /image/alimentador-reto.webp
OK  /image/queimador.webp
OK  /image/Pesquisa/cavaco-640.webp
OK  /image/Pesquisa/pellets-640.webp
OK  /image/FrtSulSC_Mapa-Representantes-Estados-Ativos.webp
OK  /image/alimentador-reto-banner1.webp
OK  /image/alimentador-reto-banner1-640.webp
OK  /image/alimentador-reto-banner1-960.webp
OK  /image/alimentador-reto-banner2-480.webp
OK  /image/alimentador-reto-banner-cell-360.webp
```

`CLAUDE.md` conferido sem alteração após a subida do `next dev` (confirma que `agentRules: false`, definido na Tarefa 1B, continua efetivo).

## 7. Fora do escopo desta tarefa (adiado)

- Validação visual (`alt`, `srcset`, dimensões, carregamento responsivo) — Tarefa 3/4, quando os componentes consumidores existirem.
- Lighthouse — entra na validação da migração visual, não nesta cópia isolada sem componentes consumidores.

## 8. Bloco de status

```text
STATUS: IMPLEMENTADA — AGUARDANDO APROVAÇÃO DUPLA/COMMIT

ALTERAÇÕES
- public/image/ criado com os 15 arquivos WebP listados na seção 2 (cópia literal, sem conversão)

VALIDAÇÕES
- hash/tamanho dos 15 arquivos (origem × destino): idênticos
- image/ permanece byte a byte inalterado (git diff vazio)
- npm run typecheck: sem erro
- npm run build: sem erro
- npm test: suíte do preview estático verde
- npm run dev + GET /image/<15 arquivos>: todos HTTP 200 + Content-Type: image/webp (ver seção 6)

FORA DO ESCOPO
- Validação visual e Lighthouse — Tarefa 3/4
- PNG/JPEG legados e originais de alta resolução (~13 MB)
- banner2-1.webp, banner3-2.webp, alimentador-reto (1).webp, alimentador-reto-banner-cell.webp — sem referência no baseline

DOCUMENTAÇÃO E SECOND BRAIN
- Após aprovação e implementação: marcar a Tarefa 2 como concluída em tasks/plan.md e tasks/todo.md
```
