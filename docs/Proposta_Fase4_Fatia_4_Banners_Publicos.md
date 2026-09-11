# Proposta técnica — Fase 4, Fatia 4 (Exibição pública de Banners)

**Documento preparado por:** Claude
**Data:** 10/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção, migration, schema ou dependência foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

Na Fatia 3 (CRUD administrativo de Banners), Jose testou o fluxo completo (criar → ativar → desativar) no deploy da Vercel e perguntou onde o banner deveria aparecer publicamente — hoje não aparece em lugar nenhum, porque a exibição pública ficou explicitamente fora do escopo daquela fatia (seção 7 da proposta anterior). Jose decidiu: **faixa promocional abaixo do Hero**, um bloco separado e mais discreto do que um hero/carrossel no topo.

O schema e a consulta pública já existem desde a Fatia 4.5 (`findActiveBannersPublic()` em `src/lib/content/banner-repository.ts`) — esta fatia não remodela dado nenhum, só adiciona o componente visual público e corrige um problema real encontrado na consulta existente (seção 2).

## 1. Veredito de escopo

Cabe na **Fase 4 — Painel administrativo** (🟡), como continuação natural da Fatia 3. É o mesmo padrão já aprovado e implementado para artigos: primeiro o CRUD administrativo (Fatia 3 de banners, Fatia "CRUD de artigos"), depois, numa fatia separada, a tela pública que consome os dados (Fatia "Novidades públicas", aprovada em `docs/Proposta_Fase4_Fatia_2_Novidades_Publicas.md`). Esta fatia repete esse precedente para banners.

## 2. Achado a corrigir antes de construir a UI pública

`findActiveBannersPublic()` (`src/lib/content/banner-repository.ts:44-59`) seleciona `imageKey`, `mimeType` e `size` — detalhes internos de storage (chave do objeto no bucket, tipo MIME bruto, tamanho em bytes) que uma consulta pública nunca deveria expor. É o mesmo tipo de achado que bloqueou a Fatia 4.6 (exposição de `coverImageKey`/`mimeType`/`size` de `Article`) antes do commit — só não foi pego naquela fatia porque nenhum consumidor público existia ainda para exercitar a função. Proposta: restringir o `select` a `id`, `title`, `linkUrl`, `imageUrl`, `altText`, `startAt`, `endAt`, `order` — os únicos campos que o componente público precisa. `active` também sai do `select` público (a função já filtra `active: true` no `where`; devolver o campo é redundante e não é dado que a página precise exibir).

## 3. Escopo técnico proposto

### 3.1 Componente público — `BannerStrip`

- Novo componente `src/components/sections/BannerStrip.tsx`, Server Component assíncrono (mesmo padrão do `ContentSection` para artigos): busca os banners ativos prontos e repassa para uma view síncrona e testável (`BannerStripView`), mesma separação já usada em `ContentSection`/`ContentSectionView`.
- Posição: `src/app/page.tsx`, entre `<HeroSection />` e `<CategoryStrip />` — o "abaixo do Hero" que Jose pediu.
- Mais de um banner ativo ao mesmo tempo é um comportamento já aprovado (`findActiveBannersPublic()` retorna todos, ordenados por `order`, sem limite artificial — decisão 5.6 da proposta da Fatia 3). Com 1 banner: exibição estática, sem necessidade de rotação. Com 2+: rotação automática simples (mesmo padrão de acessibilidade já aprovado no `ContentCarousel` — pausa em `:focus-within`, respeita `prefers-reduced-motion`, nunca só `:hover`).
- Sem banner ativo: a seção inteira não renderiza nada (`return null`), sem espaço vazio nem título "Banners" — é uma faixa promocional opcional, não uma seção obrigatória da Home.
- Banner com `linkUrl` preenchido: a imagem inteira vira um link (`<a>` envolvendo a imagem), abrindo no mesmo separador de segurança já usado em links externos do site (`rel="noopener noreferrer"` se for domínio externo). Sem `linkUrl`: só a imagem, sem elemento clicável.
- Busca envolvida em `try/catch` retornando `null` (nenhuma seção) se o banco estiver indisponível na geração — mesmo padrão de resiliência já aprovado em `ContentSection`, para nunca quebrar o build.
- Revalidação: `revalidatePath('/')` chamado pelas rotas `activate`/`deactivate`/`image` de banner (mesmo padrão de `publish`/`unpublish` de artigo) — a Home continua estática, atualizando só quando um banner muda de estado.

### 3.2 Dimensão de imagem recomendada

Pendência levantada na revisão da Fatia 3: nem `BannerForm` nem `BannerImageForm` recomendam uma dimensão ideal. Com a faixa promocional abaixo do Hero (largura do `container` do site — `min(1180px, calc(100% - 48px))`, token já documentado em `docs/DESIGN-SYSTEM.md`), proposta: recomendar **1600×400px (proporção 4:1)** — larga o suficiente para uma faixa horizontal discreta, sem competir visualmente com o Hero. Adicionar essa recomendação como texto de apoio em `BannerForm.tsx` e `BannerImageForm.tsx`, mesmo padrão já usado em `ArticleCoverUploadForm` (1200×675px, 16:9). **Fica como decisão a confirmar com Jose na seção 6** — pode preferir outra proporção.

### 3.3 Contrato de testes

- `src/lib/content/banner-repository.test.ts` — ajustar o teste de `findActiveBannersPublic` para confirmar que `imageKey`/`mimeType`/`size`/`active` não aparecem mais no `select`.
- `src/components/sections/BannerStrip.test.tsx` (ou `BannerStripView.test.tsx`, seguindo o padrão de `ContentSectionView.test.tsx`) — casos: nenhum banner ativo (não renderiza nada), um banner ativo (estático, com e sem `linkUrl`), dois ou mais banners ativos (rotação, pausa em foco, respeita `prefers-reduced-motion`), erro de banco (não quebra, não renderiza nada).

## 4. Critérios de aceite

1. `findActiveBannersPublic()` nunca devolve `imageKey`, `mimeType`, `size` ou `active`.
2. Nenhum banner ativo → seção não aparece na Home (sem espaço vazio).
3. Banner ativo fora da janela `startAt`/`endAt`, ou com `active: false`, nunca aparece — comportamento já garantido pela consulta existente, esta fatia só constrói a UI que confia nele.
4. Banner com `linkUrl` é clicável; sem `linkUrl`, só exibe a imagem.
5. Dois ou mais banners ativos giram automaticamente, pausam em `:focus-within`, respeitam `prefers-reduced-motion` — nunca pausam só em `:hover` (mesmo requisito de acessibilidade já corrigido no `ContentCarousel`, seção "Novidades e dicas").
6. `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db` e `npm run build` aprovados; `/` continua marcada como página estática (`○`) mesmo consultando o banco na geração.
7. `docs/COMPONENTS.md` atualizado com o novo componente.

## 5. Riscos de segurança, privacidade e LGPD

Nenhum dado pessoal envolvido — `Banner` é conteúdo institucional/comercial público, mesma categoria de `Product`/`Category`/`Article`. O único risco real já identificado (seção 2) é o vazamento de detalhes internos de storage pela consulta pública, corrigido nesta mesma fatia antes de a UI existir.

## 6. Decisão que precisa de confirmação de Jose antes de implementar

**Dimensão/proporção recomendada da imagem do banner** (seção 3.2): proponho 1600×400px (4:1) para uma faixa horizontal discreta abaixo do Hero. Confirmar ou ajustar antes do Codex/Claude implementar — muda o texto de apoio nos formulários e a caixa de exibição do componente público.

## 7. Fora de escopo

- Reordenação manual de banners pela UI (já era fora de escopo na Fatia 3; `order` continua editável só via seed/SQL).
- Qualquer alteração em `Partner.socialLinks` ou em outros domínios da Fase 4 (Produtos/Categorias, Representantes/Revendas).
