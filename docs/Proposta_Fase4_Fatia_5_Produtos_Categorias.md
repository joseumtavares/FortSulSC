# Proposta técnica — Fase 4, Fatia 5 (Produtos e Categorias: CRUD, cascata de ativação e exibição pública)

**Documento preparado por:** Claude
**Data:** 10/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção, migration, schema ou dependência foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

Jose pediu a próxima fatia da Fase 4: CRUD administrativo de Produtos e Categorias, com cascata de ativação (categoria desativada esconde os produtos só naquela categoria), exibição pública reaproveitando o padrão de "Novidades e dicas" (setas + popup) e o menu de categorias já existente, e um diferencial novo — depoimentos com links de redes sociais e um botão "Saiba mais" que monta um link `wa.me` com mensagem pré-definida no painel.

Esta é uma fatia grande, com mais decisões de negócio abertas do que as anteriores. Diferente das fatias de Banners/Configurações (dado quase pronto, só faltava rota+tela), aqui o schema existe mas está **zero usado** — nenhuma rota, nenhuma tela, e o catálogo público hoje é 100% estático (`src/components/solutions/solutions-data.ts`, 3 produtos fictícios). Por isso a seção 9 desta proposta lista mais pontos que precisam da sua confirmação explícita antes do Codex/Claude implementar do que nas fatias de banner.

## 1. Veredito de escopo

Cabe na **Fase 4 — Painel administrativo** (🟡). O schema de `Category`/`Product`/`ProductCategory`/`ProductApplication`/`ProductSpecification`/`ProductImage` já existe desde a Fatia 4.1 (Fase 3), aprovado e commitado — esta fatia não remodela essas tabelas, só adiciona campos novos pontuais (seção 3) e a camada de rota/tela que falta, seguindo o mesmo padrão já usado para Article e Banner.

## 2. Estado real do código (verificado nesta data)

- `Category` (`prisma/schema.prisma`): `id`, `name`, `slug`, `order`. **Sem campo `active`** — precisa ser adicionado (seção 3.1).
- `Product`: já tem `active` (Boolean, default `false`) e `hasDetailPage`. **Sem campo de "código"** explícito (só `slug`/`name`) e **sem campo para mensagem de WhatsApp** (seção 3.2/3.3).
- `ProductCategory` (junção N:N): `onDelete: Restrict` no relacionamento com `Category` — hoje o banco **impede fisicamente** excluir uma categoria com produto vinculado, sem nenhuma alteração de schema. Isso já resolve boa parte da preocupação de "categoria excluída deixa produto órfão" (seção 9.2).
- Nenhuma tabela de depoimento/testemunho existe — schema novo necessário (seção 3.4).
- Nenhuma rota `src/app/api/admin/products/**` ou `.../categories/**` existe. Nenhuma tela `/admin/products` ou `/admin/categories` existe.
- Catálogo público atual: `src/components/solutions/` (`SolutionsGrid`, `CategoryTabs`, `ProductScroller`, `SolutionCard`, `solutions-data.ts`) — **100% estático**, 3 produtos fictícios, categorias fixas (`aviario|equipamentos|fumageiro|piscicultura|secadores`, já a lista corrigida por `docs/PLANEJAMENTO_PROJETO.md`). Cards linkam para uma página HTML legada (`produto-alimentador.html`) ou abrem o diálogo de WhatsApp — **não existe popup de produto hoje**, diferente do que a mensagem de Jose presumia ("reutilizar o mesmo código que já está funcionando" se refere ao *menu* de categorias — `CategoryTabs` — e ao *padrão* de popup do artigo — `ContentArticleDialog` —, não a um popup de produto já pronto).
- Padrões prontos para reaproveitar sem alteração: `requireAdminRequest`, `recordAuditEvent`, `getImageStorage()`, layout `(dashboard)`, o padrão `Section` assíncrona + `SectionView` síncrona testável (`ContentSection`/`ContentSectionView`), o padrão de carrossel com setas (`ContentCarousel`/`.content-carousel`), `WHATSAPP_CHAT_URL`/`WHATSAPP_PHONE_TEL` (`src/lib/whatsapp.ts`) como referência de formato `wa.me`.

## 3. Extensão de schema proposta

### 3.1 `Category.active`

```prisma
model Category {
  // ...campos existentes
  active Boolean @default(true)
}
```

Migration puramente aditiva. **Default `true`** (diferente de `Product.active`, que nasce `false`) — proposto porque uma categoria é uma estrutura de navegação, não um item de conteúdo que precisa de revisão antes de aparecer; nasce visível e o admin desativa quando quiser esconder. **Fica como decisão a confirmar (seção 9.1)** — pode preferir o mesmo padrão de `Product` (nasce inativa).

### 3.2 Visibilidade em cascata — sem campo novo

A regra que você descreveu ("categoria desativada esconde os produtos só naquela categoria; produto pode estar ativo numa e aparecer só nela") **não precisa de um campo por vínculo** — dá para calcular na consulta pública combinando os dois booleanos já existentes:

```
produto aparece na categoria X  ⇔  categoria X.active = true  E  produto.active = true
```

Um produto com `active = true` associado às categorias A (ativa) e B (inativa) aparece só em A. Isso é exatamente o comportamento pedido, sem migration adicional além da 3.1.

### 3.3 Botão "Saiba mais" — link de WhatsApp com mensagem pré-definida

Precisa de uma decisão sobre onde o texto-modelo vive (seção 9.3). Proposta técnica (independente da decisão de onde guardar o texto): um utilitário `buildProductWhatsAppLink(product, template)` que substitui um placeholder (`{produto}`) pelo nome do produto e monta a URL no mesmo formato de `WHATSAPP_CHAT_URL`:

```ts
`https://wa.me/${WHATSAPP_PHONE_TEL_DIGITS}?text=${encodeURIComponent(template.replace('{produto}', product.name))}`
```

Sem `utm_source` (o exemplo que você deu tinha `utm_source=chatgpt.com`, que veio de um link gerado por IA de exemplo, não de uma decisão de marketing — proponho omitir a menos que você queira rastrear origem do clique, o que exigiria decidir um valor fixo, ex. `utm_source=site`).

### 3.4 Depoimentos — schema novo

```prisma
enum TestimonialPlatform {
  TIKTOK
  FACEBOOK
  INSTAGRAM
}

model ProductTestimonial {
  id         String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId  String               @map("product_id") @db.Uuid
  platform   TestimonialPlatform
  url        String
  authorName String?              @map("author_name")
  order      Int                  @default(0)
  createdAt  DateTime             @default(now()) @map("created_at")
  product    Product              @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_testimonials")
}
```

`url` validado no servidor como link HTTPS do domínio correspondente à plataforma (mesmo princípio já usado em `social-links.ts` para Configurações institucionais — evita um depoimento "do TikTok" apontar para qualquer URL arbitrária). **Limite por produto a confirmar (seção 9.4)**.

## 4. Escopo técnico proposto

### 4.1 Repositórios

- `src/lib/content/category-repository.ts`: `listCategoriesForAdmin()`, `findCategoryForAdmin(id)`, `createCategory`, `updateCategory` (nome/slug/order/active), `deleteCategory(id)` (deixa o `onDelete: Restrict` do banco fazer a checagem — captura o erro de FK e devolve mensagem clara "categoria tem produtos vinculados", em vez de checar manualmente antes).
- `src/lib/content/product-repository.ts`: `listProductsForAdmin()`, `findProductForAdmin(id)`, `createProduct`, `updateProduct`, `updateProductCategories(id, categoryIds)`, `updateProductActive(id, active)`, `deleteProduct(id)` (ver decisão 9.2), mais os sub-recursos (aplicações, especificações, imagens, depoimentos) seguindo o padrão de `article-image-repository.ts`.
- `listActiveProductsPublic()`: consulta pública com seleção explícita de campos (nunca `catalogUrl` interno se vier a ter algo sensível, nunca chaves de storage de imagem — mesmo cuidado já corrigido em `findActiveBannersPublic`), filtrando `product.active = true` e, por categoria, só categorias com `active = true`.

### 4.2 Rotas administrativas

Todas usam `requireAdminRequest` + `recordAuditEvent`, mesmo padrão de artigo/banner.

| Domínio | Rotas |
|---|---|
| Categorias | `GET/POST /api/admin/categories`, `PATCH /api/admin/categories/[id]` (nome/slug/order), `POST .../activate`, `POST .../deactivate`, `DELETE /api/admin/categories/[id]` |
| Produtos | `GET/POST /api/admin/products`, `PATCH /api/admin/products/[id]` (texto), `PUT .../categories` (vínculos), `POST .../activate`, `POST .../deactivate`, `DELETE /api/admin/products/[id]` (ver 9.2), `POST/DELETE .../images[/[imageId]]`, `POST/PATCH/DELETE .../applications[/[id]]`, `POST/PATCH/DELETE .../specifications[/[id]]`, `POST/PATCH/DELETE .../testimonials[/[id]]` |

`AuditAction` já tem `CREATE`/`UPDATE`/`ACTIVATE`/`DEACTIVATE`/`DELETE` — nenhuma alteração de enum necessária além de usar `DELETE` pela primeira vez (já existe desde a Fatia 4.4, nunca usado, reservado para este caso).

### 4.3 Telas administrativas

- `/admin/categories` (lista) e `/admin/categories/novo`/`[id]` (formulário nome/slug/order + ativar/desativar + excluir).
- `/admin/products` (lista) e `/admin/products/novo`/`[id]` (formulário de texto, seletor de categorias, galeria de imagens, aplicações, especificações, depoimentos, ativar/desativar, excluir).

### 4.4 Exibição pública — migração de `solutions-data.ts` para dados reais

- `SolutionsSection` vira Server Component assíncrono (mesmo padrão `ContentSection`), busca `listActiveProductsPublic()` e `listActiveCategoriesPublic()`, repassa pronto para `SolutionsGrid` (que continua reaproveitando `CategoryTabs` sem alteração — "o menu de categorias que já está funcionando", como você pediu).
- `SolutionCard` deixa de linkar para `produto-alimentador.html` ou abrir só o diálogo de WhatsApp: passa a abrir um popup novo, `ProductDialog` (mesmo padrão de acessibilidade de `ContentArticleDialog` — `<dialog>` nativo, foco preso, `Escape`, clique fora), mostrando descrição, aplicações, especificações, galeria de fotos (reaproveitando a navegação de `ContentArticleDialog`), depoimentos (ícone da rede + link) e o botão "Saiba mais" (WhatsApp).
- `produto-alimentador.html` (página estática legada) fica órfã após esta fatia — **fora do escopo remover agora** (ver seção 8), mas deixa de ser linkada por qualquer produto novo.

### 4.5 Contrato de testes

Mesmo padrão já usado nas fatias anteriores — um `route.test.ts` por rota, testes de repositório (incluindo caso de cascata: categoria inativa some, produto inativo some, produto ativo em categoria inativa não aparece nela mas aparece em outra ativa), e testes de componente para `ProductDialog`/`SolutionCard` cobrindo popup, galeria, depoimentos e o link de WhatsApp gerado.

## 5. Fora de escopo

- Remover `produto-alimentador.html`, `image/` órfãos ou o link antigo do menu (decisão separada, não bloqueia esta fatia).
- Busca/filtro textual de produtos (só os filtros de categoria já existentes).
- Reordenação de categorias/produtos pela UI (fica só via campo `order`, mesmo padrão de `Banner`).
- Qualquer trabalho de Representantes/Revendas.

## 6. Riscos de segurança, privacidade e LGPD

Nenhum dado pessoal — `Product`/`Category`/`ProductTestimonial` são conteúdo comercial público, mesma categoria de `Article`/`Banner`. Único ponto de atenção: `ProductTestimonial.url` precisa validação de domínio por plataforma (mesmo princípio de `social-links.ts`) para não virar um campo de link arbitrário.

## 7. Critérios de aceite

1. Categoria desativada nunca aparece nos filtros públicos; produtos que só tinham essa categoria somem do catálogo público (mas continuam editáveis no painel).
2. Produto ativo em duas categorias, uma ativa e uma inativa, aparece só na ativa.
3. `DELETE` de categoria com produto vinculado falha com mensagem clara (aproveitando a restrição já existente no banco); `DELETE` sem produto vinculado funciona.
4. Depoimento com URL fora do domínio esperado da plataforma é rejeitado.
5. Botão "Saiba mais" gera link `wa.me` correto, com o nome do produto substituído no texto.
6. `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db` e `npm run build` aprovados.
7. `docs/COMPONENTS.md` atualizado com os componentes novos.

## 8. Fluxo obrigatório de aprovação

Igual às fatias anteriores: proposta → aprovação de Jose (seção 9) → implementação em worktree isolada → `scope-gate-reviewer` (schema novo + rotas novas) → `ui-reviewer` (telas novas) → testes completos → teste manual de Jose → aprovação dupla → commit/merge/push.

## 9. Decisões que exigem aprovação explícita de Jose antes de implementar

1. **`Category.active` nasce `true` ou `false` por padrão?** Proponho `true` (seção 3.1) — confirmar ou pedir o padrão de `Product` (nasce `false`).
2. **Exclusão física de produto**: você pediu "exclusão" explicitamente, diferente do padrão "sem exclusão, só ativar/desativar" já usado em `Article` e `Banner`. Confirmar se é para valer — exclusão física real (perde histórico de auditoria vinculado, `AuditLog.entityId` fica órfão; a estratégia de retenção de log já existente cobre isso, mas é uma mudança de comportamento real) — ou se prefere manter só ativar/desativar para produto também, como nos outros dois domínios.
3. **Exclusão de categoria com produtos vinculados**: o banco já bloqueia fisicamente (`onDelete: Restrict`). Confirmar que o comportamento correto é "bloquear e mostrar erro claro" (proposta desta seção) — a alternativa seria desvincular produtos automaticamente antes de excluir, o que exigiria mudar o schema e é mais arriscado.
4. **Onde vive a mensagem de WhatsApp pré-definida**: (a) um texto único global (ex.: em Configurações institucionais, reaproveitando a tela já existente) aplicado a todos os produtos com `{produto}` substituído; ou (b) um campo por produto, permitindo mensagem customizada por item. Proponho (a) por simplicidade — confirmar ou pedir (b).
5. **"Código do produto"** usado na mensagem/URL: hoje não existe um campo "código" no schema, só `name` (nome) e `slug` (URL). Confirmar se o "X" da mensagem deve ser o nome do produto (proposta) ou se precisa um campo novo de código/SKU.
6. **Limite de depoimentos por produto**: proponho sem limite rígido (diferente da galeria de artigo, limitada a 4) já que é conteúdo curado manualmente pelo admin — confirmar ou pedir um limite.
7. **Os 3 produtos fictícios de `solutions-data.ts` viram seed real ou o catálogo público fica vazio até você cadastrar pelo painel?** Se viram seed, preciso das imagens/textos reais dos produtos (os atuais são placeholder de teste, conforme `docs/CODEBASE_MAP.md`).

Sem resposta a estes pontos, o Codex/Claude para exatamente neles, implementando o restante com as suposições conservadoras descritas em cada seção, seguindo o mesmo princípio já usado nas fatias de Banners.

## 10. Decisões confirmadas por Jose em 10/09/2026

1. `Category.active` nasce `true` por padrão.
2. Exclusão física de produto confirmada — vale mesmo, diferente do padrão de `Article`/`Banner`.
3. Categoria com produto vinculado mantém o bloqueio de exclusão (comportamento já garantido pelo banco) até o produto ser desvinculado.
4. Mensagem de WhatsApp é customizável por produto — campo novo `Product.whatsappMessageTemplate` (nullable, com modelo padrão de fallback se vazio).
5. Campo novo `Product.code`, inserido pelo admin no painel (não derivado automaticamente).
6. Limite de 3 depoimentos por produto.
7. Catálogo público fica vazio até Jose cadastrar produtos reais pelo painel — nenhum dado fictício de `solutions-data.ts` migra para o banco.
