# Proposta técnica — Tarefa 4, Fatia 4.1 (Fundação Prisma + catálogo público)

Status: APROVADA POR JOSE EM 01/09/2026 — pronta para o Codex implementar (nenhum código, schema ou migration foi criado por esta proposta)
Data: 01/09/2026

## 0. Origem e estado do repositório

- Esta é a versão autônoma da Fatia 4.1, extraída de `docs/Proposta_Tarefa_4_Fase3_Modelagem.md` (seção 7), que continua sendo a referência do modelo conceitual completo da Fase 3 (todas as entidades, §3) e do roadmap em 5 fatias (§6). Este documento existe só para facilitar o handoff direto ao Codex, no mesmo padrão usado nas fatias da Tarefa 3 (`docs/Proposta_Tarefa_3_Fatia_N.md`).
- Modelo geral (§3 da proposta original) e as decisões consolidadas em `docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md` foram aprovados por Jose em 01/09/2026 ("aprovado, todas as alterações foram solicitadas e validadas por mim").
- Commit mais recente na `main`: `4bf9275 merge: concluir Fase Docker`. Sem Prisma, sem `DATABASE_URL`, sem `depends_on` no serviço `app` até esta fatia.
- O serviço `db` do `docker-compose.yaml` **não publica porta no host** (decisão mantida, item I3 da entrevista) — toda operação de Prisma (`migrate`, `db seed`, testes de integração) roda via `docker compose exec app ...`.

## 1. Escopo desta fatia

Fundação de dados do catálogo público de produtos: `Category`, `Product`, `ProductCategory` (junção N:N), `ProductImage`, `ProductApplication`, `ProductSpecification`. Sem dado sensível, sem autenticação, sem UI consumindo os dados ainda — apenas schema, migration, seed e camada mínima de acesso a dados (`src/lib/db/client.ts`).

### 1.1 Incluído

- Adicionar `prisma` e `@prisma/client` a `package.json`.
- `prisma/schema.prisma` com os modelos da seção 3 abaixo.
- Primeira migration (`prisma migrate dev --name fatia_4_1_category_product`).
- `prisma/seed.ts` inserindo as seis categorias oficiais (upsert idempotente por `slug`): Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores, Acessórios.
- `src/lib/db/client.ts` exportando um `PrismaClient` singleton (padrão Next.js recomendado para evitar múltiplas conexões em dev) — **sem** Server Actions, Route Handlers ou UI consumindo isso ainda.
- Atualização de `docker-compose.yaml`: `DATABASE_URL` e `depends_on: db: condition: service_healthy` no serviço `app`.
- Atualização de `.env.example` com `DATABASE_URL` derivada das variáveis já existentes (sem valor real).
- Testes automatizados (contrato completo na seção 5).

### 1.2 Excluído desta fatia (fica para fatias seguintes, com proposta própria)

- Qualquer entidade de `Representative`, `Reseller`, `AdminUser`, `Article`, `AuditLog`, `InstitutionalSettings`, `Banner`, `LoginAttempt` — Fatias 4.2 a 4.5.
- Autenticação, painel administrativo, upload real para R2 (os campos `imageUrl`/`imageKey` existem no schema, mas nada faz upload ainda).
- Qualquer Route Handler, Server Action ou página pública consumindo os dados.
- Popular os ~10 produtos reais do lançamento — o seed desta fatia só cria as seis categorias.
- Migrar o conteúdo/UI já implementado do Incremento 5 (`solutions-data.ts`/`SolutionFilters`) para as seis categorias — tarefa própria, fora desta fatia (ver `docs/PLANEJAMENTO_PROJETO.md`, seção "Resolução de conflitos").

## 2. Por que N:N entre produto e categoria

`src/components/solutions/solutions-data.ts` já modela cada solução com um **array** de categorias (`categories: ['equipamentos', 'fumageiro']`), não uma categoria única — comportamento já aprovado e em produção na Home (Incremento 5). A tabela de junção `ProductCategory` abaixo preserva esse comportamento.

## 3. `prisma/schema.prisma` proposto

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  products ProductCategory[]

  @@map("categories")
}

model Product {
  id               String   @id @default(cuid())
  slug             String   @unique
  name             String
  eyebrow          String?
  shortDescription String?  @map("short_description")
  description      String?
  catalogUrl       String?  @map("catalog_url")
  active           Boolean  @default(false)
  hasDetailPage    Boolean  @default(false) @map("has_detail_page")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  categories     ProductCategory[]
  applications   ProductApplication[]
  specifications ProductSpecification[]
  images         ProductImage[]

  @@map("products")
}

model ProductCategory {
  productId  String @map("product_id")
  categoryId String @map("category_id")

  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@id([productId, categoryId])
  @@map("product_categories")
}

model ProductApplication {
  id        String  @id @default(cuid())
  productId String  @map("product_id")
  label     String
  order     Int     @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_applications")
}

model ProductSpecification {
  id        String  @id @default(cuid())
  productId String  @map("product_id")
  label     String
  value     String
  order     Int     @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_specifications")
}

enum ProductImageRole {
  HERO
  GALLERY
}

model ProductImage {
  id        String            @id @default(cuid())
  productId String            @map("product_id")
  imageUrl  String            @map("image_url")
  imageKey  String            @map("image_key")
  mimeType  String            @map("mime_type")
  size      Int
  altText   String            @map("alt_text")
  role      ProductImageRole  @default(GALLERY)
  order     Int               @default(0)
  createdAt DateTime          @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}
```

Nomes de tabela em `snake_case` via `@@map`/`@map`, seguindo a convenção Postgres já usada como referência em `docs/ARCHITECTURE.md` §10.

## 4. `docker-compose.yaml` — diff proposto no serviço `app`

```diff
   app:
     build:
       context: .
       dockerfile: Dockerfile
     ports:
       - "3000:3000"
+    environment:
+      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
+    depends_on:
+      db:
+        condition: service_healthy
     networks:
       - fortsul-internal
```

`.env.example` ganha um comentário explicando que `DATABASE_URL` é resolvida dentro do Compose a partir de `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` já existentes — sem novo segredo versionado.

## 5. Contrato de testes (código)

`src/lib/db/__tests__/fatia-4-1.integration.test.ts` (Vitest, roda contra o Postgres do `db` via rede interna do Compose — ver seção 6):

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Fase 3 — Fatia 4.1: fundação Category/Product', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.productImage.deleteMany({ where: { product: { slug: { startsWith: 'test-' } } } })
    await prisma.productSpecification.deleteMany({ where: { product: { slug: { startsWith: 'test-' } } } })
    await prisma.productApplication.deleteMany({ where: { product: { slug: { startsWith: 'test-' } } } })
    await prisma.productCategory.deleteMany({ where: { product: { slug: { startsWith: 'test-' } } } })
    await prisma.product.deleteMany({ where: { slug: { startsWith: 'test-' } } })
    await prisma.category.deleteMany({ where: { slug: { startsWith: 'test-' } } })
    await prisma.$disconnect()
  })

  it('seed cria as seis categorias oficiais, na ordem aprovada', async () => {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    expect(categories.map((c) => c.slug)).toEqual([
      'fumicultura',
      'equipamentos',
      'aviario',
      'piscicultura',
      'secadores',
      'acessorios',
    ])
  })

  it('slug de categoria é único', async () => {
    await prisma.category.create({ data: { name: 'Teste', slug: 'test-categoria', order: 99 } })
    await expect(
      prisma.category.create({ data: { name: 'Duplicada', slug: 'test-categoria', order: 100 } }),
    ).rejects.toThrow()
  })

  it('produto pode pertencer a mais de uma categoria (N:N, paridade com solutions-data.ts)', async () => {
    const [cat1, cat2] = await Promise.all([
      prisma.category.create({ data: { name: 'T1', slug: 'test-cat-1', order: 90 } }),
      prisma.category.create({ data: { name: 'T2', slug: 'test-cat-2', order: 91 } }),
    ])
    const product = await prisma.product.create({
      data: {
        slug: 'test-produto-multi-categoria',
        name: 'Produto teste',
        categories: { create: [{ categoryId: cat1.id }, { categoryId: cat2.id }] },
      },
      include: { categories: true },
    })
    expect(product.categories).toHaveLength(2)
  })

  it('slug de produto é único', async () => {
    await prisma.product.create({ data: { slug: 'test-produto-unico', name: 'Produto único' } })
    await expect(
      prisma.product.create({ data: { slug: 'test-produto-unico', name: 'Duplicado' } }),
    ).rejects.toThrow()
  })

  it('produto nasce inativo (active=false) por padrão', async () => {
    const product = await prisma.product.create({
      data: { slug: 'test-produto-draft', name: 'Produto rascunho' },
    })
    expect(product.active).toBe(false)
    expect(product.hasDetailPage).toBe(false)
  })

  it('produto pode guardar link público opcional para catálogo PDF', async () => {
    const product = await prisma.product.create({
      data: {
        slug: 'test-produto-catalogo',
        name: 'Produto com catálogo',
        catalogUrl: 'https://cdn.example/catalogo-produto.pdf',
      },
    })
    expect(product.catalogUrl).toBe('https://cdn.example/catalogo-produto.pdf')
  })

  it('excluir produto remove em cascata aplicações, especificações, imagens e vínculos de categoria', async () => {
    const category = await prisma.category.create({ data: { name: 'T3', slug: 'test-cat-cascade', order: 92 } })
    const product = await prisma.product.create({
      data: {
        slug: 'test-produto-cascade',
        name: 'Produto cascade',
        categories: { create: [{ categoryId: category.id }] },
        applications: { create: [{ label: 'Aplicação teste', order: 0 }] },
        specifications: { create: [{ label: 'Spec', value: 'Valor', order: 0 }] },
        images: {
          create: [
            {
              imageUrl: 'https://r2.example/test.webp',
              imageKey: 'test/test.webp',
              mimeType: 'image/webp',
              size: 1024,
              altText: 'Imagem de teste',
              role: 'GALLERY',
              order: 0,
            },
          ],
        },
      },
    })

    await prisma.product.delete({ where: { id: product.id } })

    const [apps, specs, images, links] = await Promise.all([
      prisma.productApplication.findMany({ where: { productId: product.id } }),
      prisma.productSpecification.findMany({ where: { productId: product.id } }),
      prisma.productImage.findMany({ where: { productId: product.id } }),
      prisma.productCategory.findMany({ where: { productId: product.id } }),
    ])
    expect([apps, specs, images, links].every((rows) => rows.length === 0)).toBe(true)
  })

  it('não permite excluir categoria referenciada por um produto (onDelete: Restrict)', async () => {
    const category = await prisma.category.create({ data: { name: 'T4', slug: 'test-cat-restrict', order: 93 } })
    await prisma.product.create({
      data: {
        slug: 'test-produto-restrict',
        name: 'Produto restrict',
        categories: { create: [{ categoryId: category.id }] },
      },
    })
    await expect(prisma.category.delete({ where: { id: category.id } })).rejects.toThrow()
  })

  it('imagem de produto exige altText (regra de acessibilidade obrigatória)', async () => {
    const product = await prisma.product.create({ data: { slug: 'test-produto-alt', name: 'Produto alt' } })
    // @ts-expect-error — altText omitido de propósito para provar que o schema recusa a gravação
    await expect(
      prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: 'https://r2.example/x.webp',
          imageKey: 'test/x.webp',
          mimeType: 'image/webp',
          size: 100,
        },
      }),
    ).rejects.toThrow()
  })
})
```

## 6. Como rodar (dado que o `db` não publica porta no host)

```bash
docker compose up -d

docker compose exec app npx prisma migrate dev --name fatia_4_1_category_product
docker compose exec app npx prisma db seed

docker compose exec app npm run test:db
```

Novo script sugerido em `package.json`: `"test:db": "vitest run src/lib/db"` e `"prisma": { "seed": "tsx prisma/seed.ts" }` (ou `ts-node`, a critério do Codex, desde que documentado).

## 7. Validações automatizadas e manuais

Automatizadas: `docker compose config --quiet`, `docker compose exec app npx prisma validate`, `docker compose exec app npx prisma migrate dev`, `docker compose exec app npm run test:db`, `typecheck`, `next build` (garante que adicionar Prisma não quebra o build da Home já existente).

Manuais, a cargo de Jose: confirmar que `docker compose up` continua subindo a Home normalmente (nenhuma regressão visual, esta fatia não toca em UI); revisar o `schema.prisma` final gerado quanto aos nomes de tabela/coluna.

## 8. Riscos

- Sem risco de dado sensível ou de negócio: catálogo público, sem PII.
- Esta fatia não popula produtos reais nem migra o conteúdo do alimentador para as novas categorias — fica para fatia própria.
- Adicionar `depends_on: condition: service_healthy` no `app` muda o comportamento do `docker compose up` (o `app` passa a esperar o `db` ficar saudável antes de subir) — mudança pequena e esperada.

Proposta de commit atômico ao final: `feat: adicionar fundação Prisma e modelo de catálogo (Fase 3, Fatia 4.1)`.

## 9. Bloco de status

Status: **APROVADA — PRONTA PARA O CODEX**. Fluxo a partir daqui, conforme `docs/FortSulSC_instrucoes_Hermes_Codex.md` §6.3:
1. Codex implementa em branch/worktree próprio (`feature/codex-fatia-4-1` ou equivalente);
2. Jose traz o resumo da implementação e dos testes para revisão técnica do Claude;
3. commit e push continuam exclusivamente com Jose, após aprovação dupla.

Referência completa do modelo geral da Fase 3 (todas as entidades, roadmap 4.2-4.5): `docs/Proposta_Tarefa_4_Fase3_Modelagem.md`.
