# Proposta técnica — Tarefa 4 (Fase 3): Modelagem de dados e fundação Prisma

Status: APROVADA POR JOSE EM 01/09/2026 (nenhum código de produção, schema ou migration foi criado por esta proposta; implementação da Fatia 4.1 liberada ao Codex)
Data: 01/09/2026

## 0. Estado do repositório e fontes consultadas

- Commit mais recente na `main`: `4bf9275 merge: concluir Fase Docker` (incorpora `6132b14 feat: adicionar fundação Docker`). A Fase Docker está formalmente concluída e commitada — `Dockerfile`, `docker-compose.yaml`, `.env.example`, `.dockerignore`, sem Prisma, sem `DATABASE_URL`, sem `depends_on` no serviço `app`, sem conexão real app→banco.
- Lidos nesta sessão: `docs/PLANO_MESTRE_FORTSULSC.md` (Parte I a VII, especialmente seção 0.2, seção 4 e Fase 3 da Parte IV), `docs/PLANEJAMENTO_PROJETO.md` (escopo de produto por item, tabela §23), `docs/ARCHITECTURE.md` (§5, §10), `docs/API.md`, `docs/RULES.md`, `docs/FortSulSC_instrucoes_Hermes_Codex.md`, `docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md` (respostas consolidadas do cliente), `docker-compose.yaml`, `.env.example`, `package.json`, árvore de `src/`.
- Código já migrado inspecionado: `src/components/solutions/solutions-data.ts`, `SolutionFilters.tsx`, `SolutionsGrid.tsx` (Incremento 5, já aprovado e implementado na Home).
- Histórico do baseline estático inspecionado: `produto-alimentador.html` (commit `88e7d6f`), única página de produto existente até hoje, ainda não migrada para Next.js.
- `next: ^16.2.9`, `react: ^19.2.7`, `typescript: ^5`; nenhuma dependência de Prisma/banco presente em `package.json` hoje.

## 1. Por que esta é a próxima tarefa

O Plano Mestre (§0.2) registra a Fase Docker como 🟢 e a Fase 3 — Modelagem e regras de negócio — como 🔴, com o gate: **"Só pode começar após consulta e aprovação explícita do Jose — inclui aprovar regras de negócio, modelagem de banco e política de consentimento de dados de representantes."** O consentimento de representantes e a política de privacidade já foram resolvidos (Parte II do Plano Mestre); falta apenas a modelagem em si.

A Fase 3 exige como entregável final: **"modelagem completa apresentada (entidades, modelo relacional, diagrama, plano de migrations) sem criar nenhuma tabela ainda, aguardando autorização expressa"** (Plano Mestre, Parte IV, Fase 3). Esta proposta cumpre exatamente esse requisito: apresenta o modelo conceitual **completo** de todas as entidades previstas, sem escrever nenhum `schema.prisma` ou migration ainda.

Como o Jose pediu também o "desenvolvimento" e a proposta da próxima tarefa para o Codex, a seção 7 já entrega, pronta para implementação, a primeira fatia (a mais segura: catálogo público de produtos, sem dado sensível, sem autenticação) — para que, assim que você aprovar o modelo geral, o Codex possa começar sem nova rodada de espera.

## 2. O que esta proposta autoriza e o que ela não autoriza

Autoriza, se aprovada:
- a leitura desta modelagem como referência vigente para toda a Fase 3;
- o início da Fatia 4.1 (seção 7) pelo Codex, seguindo o fluxo de aprovação em duas camadas normal (proposta → sua aprovação → revisão do Claude → implementação → testes → aprovação dupla → commit).

Não autoriza:
- a criação de nenhuma tabela, migration ou schema fora da Fatia 4.1;
- autenticação, painel administrativo, upload real para R2, ou qualquer regra de negócio das Fatias 4.2 a 4.5 (seção 6) — cada uma virá como proposta própria, na mesma profundidade desta, antes de ser implementada;
- alteração de conteúdo público (textos, categorias exibidas, WhatsApp) — nada disso muda com esta proposta.

## 3. Modelo conceitual completo da Fase 3

Diagrama de relações (visão geral; detalhamento por entidade abaixo):

```text
Category ──N:N── Product ──1:N── ProductImage
                     │
                     ├──1:N── ProductApplication
                     └──1:N── ProductSpecification

Region ──N:N── Representative ──1:1── RepresentativePrivate
Region ──N:N── Reseller       ──1:1── ResellerPrivate

AdminUser (Admin | Editor) ──1:N── AuditLog
AdminUser ──1:N── Article
AdminUser ──1:N── LoginAttempt

Article (Novidades/Artigos — CMS, Fase 3)
InstitutionalSettings (singleton: WhatsApp, telefone, e-mail)
Banner ──N:1── (opcional) Product
```

### 3.1 `Category`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string (cuid) | |
| `name` | string | Nome exibido (ex.: "Aviário") |
| `slug` | string, único | `fumicultura`, `equipamentos`, `aviario`, `piscicultura`, `secadores`, `acessorios` |
| `order` | int | Ordem de exibição nos filtros |
| `createdAt`/`updatedAt` | datetime | |

Dado público. Seed inicial com as seis categorias consolidadas na entrevista: **Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores e Acessórios**. Criação de categoria nova continua exigindo aprovação explícita do José — regra de processo administrativo (Fase 4, painel), não uma constraint de banco.

### 3.2 `Product`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string (cuid) | |
| `slug` | string, único | URL pública `/produtos/[slug]` |
| `name` | string | |
| `eyebrow` | string, opcional | Rótulo curto acima do título (ex.: badge de categoria no card) |
| `shortDescription` | string, opcional | Usado em cards/listagem |
| `description` | string, opcional | Texto longo da página de produto |
| `catalogUrl` | string, opcional | Link público para o catálogo PDF, quando houver |
| `active` | boolean, default `false` | Publicado ou rascunho |
| `hasDetailPage` | boolean, default `false` | `false` permite card com descrição curta, sem página completa |
| `createdAt`/`updatedAt` | datetime | |

Dado público (nenhum campo sensível). Relaciona-se com `Category` via tabela de junção (**N:N**, não 1:N — ver seção 4.1). Um produto pode existir apenas como card com descrição curta; `hasDetailPage` controla a página completa.

### 3.3 `ProductImage`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string (cuid) | |
| `productId` | FK → Product | cascade on delete |
| `imageUrl` | string | URL pública servida pelo Next.js a partir do R2 |
| `imageKey` | string | chave no bucket R2 — nunca a imagem em si (decisão já aprovada, Parte II do Plano Mestre) |
| `mimeType` | string | |
| `size` | int | bytes |
| `altText` | string | obrigatório (regra de acessibilidade, `docs/RULES.md` §8) |
| `role` | enum `HERO \| GALLERY` | espelha o padrão já usado no baseline (`product-main-image` vs. `product-gallery-grid`) |
| `order` | int | |

### 3.4 `ProductApplication`

`{ id, productId (FK), label, order }` — lista de itens como "Cavaco de madeira", "Briquete", "Pellets" (seção "Aplicações" do baseline `produto-alimentador.html`).

### 3.5 `ProductSpecification`

`{ id, productId (FK), label, value, order }` — pares chave/valor livres (ex.: "Materiais indicados" → "Cavaco, briquete e pellets"), porque `docs/PLANEJAMENTO_PROJETO.md` §20 registra que "campos detalhados de produtos" continuam em aberto; uma tabela chave/valor evita alterar o schema a cada novo tipo de especificação, sem forçar todos os produtos a terem os mesmos campos.

### 3.6 `Region`

`{ id, name, slug, createdAt/updatedAt }` — agrupa representantes/revendas por região geográfica (uso já sugerido em `PLANEJAMENTO_PROJETO.md` e no roadmap de entidades do Plano Mestre §0.2, linha da Fase 3).

### 3.6.1 Cobertura de regiões

`RepresentativeRegion { representativeId, regionId }` e `ResellerRegion { resellerId, regionId }` são tabelas de junção com chave composta. Um parceiro pode atender várias regiões, e cada região pode ter vários parceiros. O site público usa essas relações para listar parceiros da região selecionada e, se não houver resultado, oferece o WhatsApp institucional.

### 3.7 `Representative` (dados públicos) e `RepresentativePrivate` (dados privados)

Modelo de referência já aprovado (Plano Mestre, Parte II): separação física entre tabela pública e privada.

`Representative` (público): `{ id, name, description, whatsapp, socialLinks (json), websiteUrl, logoUrl, active, approximateLat, approximateLng, createdAt/updatedAt }` + relação N:N com `Region` via `RepresentativeRegion`. A descrição curta conta a história/atuação da empresa parceira. Coordenadas são **aproximadas**, nunca endereço exato.

`RepresentativePrivate` (privado, 1:1 com `Representative`): `{ id, representativeId (FK único), document?, consentGivenAt, consentRevokedAt?, consentNotes? }`. Documento só é armazenado quando necessário; a revogação de consentimento desativa o perfil público em até 24 horas. Nunca exposto por rota pública; acesso restrito ao admin autenticado.

Já aprovado pelo Jose em 30/08/2026: representantes/revendas deram consentimento para publicação de nome, WhatsApp e localização aproximada (Plano Mestre, Parte II) — desbloqueia esta modelagem.

### 3.8 `Reseller` / `ResellerPrivate`

Mesma separação público/privado de 3.7, incluindo `description`, `websiteUrl`, regiões N:N e consentimento/revogação, mas para revendas — entidade distinta de `Representative` (nomenclatura não pode ser tratada como sinônimo). As duas aparecem na mesma experiência pública de busca, identificadas pelo tipo correto.

### 3.9 `AdminUser`

`{ id, email (único), name, role (enum ADMIN | EDITOR), passwordHash/authProvider (via Auth.js), active, createdAt/updatedAt }` — dois perfis aprovados. Somente Admin cria, bloqueia ou desativa contas. O login exigirá código enviado ao e-mail cadastrado para todos os usuários internos; Auth.js também exige tabelas próprias (`Account`, `Session`, `VerificationToken`) conforme o adapter escolhido — detalhe técnico da Fatia 4.3.

### 3.10 `Article` ("Artigos" — CMS editorial, distinto de "Novidades e dicas" estático)

`{ id, slug, title, excerpt, body, publishedAt (público), authorId (FK AdminUser, nunca exposto publicamente), status (DRAFT | PUBLISHED), createdAt/updatedAt }` — autor não aparece na página pública, mas fica registrado internamente (`PLANEJAMENTO_PROJETO.md` §10.1/10.2). Não deve ser confundido nem fundido com a seção estática "Novidades e dicas" (Fase 1/2, já implementada, sem CMS).

### 3.11 `AuditLog`

`{ id, adminUserId (FK), action, entityType, entityId, result, createdAt }` — histórico de ações administrativas relevantes (`PLANEJAMENTO_PROJETO.md` §11): publicação/edição de artigo, criação/edição de produto, exclusão, alteração de categoria, alteração de telefone/e-mail institucional. Nunca registra CPF, documento, dado bancário, endereço privado ou telefone pessoal em texto livre (`docs/API.md` §5.4).

### 3.11.1 `LoginAttempt`

`{ id, adminUserId? (FK), email, ipHash, result, blockedUntil?, createdAt }` — evento de autenticação para aplicar bloqueio temporário após cinco tentativas malsucedidas e avisar o administrador. O IP é guardado como hash com segredo de servidor, nunca como texto exposto em tela pública. Registros de segurança seguem a política de retenção de um ano.

### 3.12 `InstitutionalSettings`

Tabela singleton (uma única linha): `{ id, whatsapp, phone, email, socialLinks (json), cnpj, businessAddress, updatedAt, updatedByAdminUserId }`. WhatsApp, telefone, e-mail, redes sociais, CNPJ e endereço institucional são editáveis por Admin e Editor. Até a Fase 4 (painel) existir, o frontend continua lendo valores hardcoded — estado transitório aceitável.

### 3.13 `Banner`

`{ id, imageUrl, imageKey, mimeType, size, linkUrl, productId (FK opcional), active, order, startsAt, endsAt, createdAt/updatedAt }` — já citado em `ARCHITECTURE.md` §3/§5 como módulo administrativo previsto.

### 3.14 Regras transversais consolidadas

- Produtos são catálogo e contato: não há preço, carrinho, estoque, pagamento ou compra online.
- Um clique em contato abre WhatsApp com a mensagem: “Vim do site da FortSul e gostaria de mais informações.” Para parceiro selecionado, usa o WhatsApp público daquele parceiro; sem parceiro na região, usa o WhatsApp da FortSul.
- O sistema não grava formulário ou conversa de visitante; analytics, se usado, é anônimo/essencial.
- Imagens permitidas para upload são SVG, JPG, PNG e WebP. O PDF de catálogo é referenciado por URL pública aprovada; não há upload autônomo de PDFs nesta fase.
- Produtos, parceiros e contas usam desativação/ocultação em vez de exclusão imediata. Dados pessoais e registros de segurança são retidos por um ano e depois removidos/anonimizados conforme obrigação legal.

## 4. Pontos de atenção descobertos ao revisar o código já implementado

### 4.1 Categoria de produto é N:N, não N:1

`src/components/solutions/solutions-data.ts` já modela cada solução com um **array** de categorias (`categories: ['equipamentos', 'fumageiro']`), não uma categoria única. Isso é comportamento de produto já aprovado e implementado na Home (Incremento 5, `SolutionFilters`/`SolutionsGrid`). A modelagem em 3.1/3.2 usa uma tabela de junção `ProductCategory` para preservar esse comportamento — uma FK única em `Product` quebraria a paridade com o que já está no ar.

### 4.2 Inconsistência herdada: `displayCategory: 'Biomassa'`

O baseline e `solutions-data.ts` usam o rótulo "Biomassa" para o alimentador. A entrevista confirmou que Biomassa não será categoria. O dado de conteúdo deve ser migrado para as categorias finais aplicáveis; para o alimentador, a referência atual é **Equipamentos + Fumicultura**. A categoria `acessorios` é a sexta categoria aprovada, não Biomassa.

### 4.3 Nem toda "solução" hoje tem página de produto própria

Duas das três soluções atuais (`queimador-estufas`, `solucoes-biomassa`) têm `href: '#whatsapp-dialog'` — cartão que só abre o WhatsApp, sem página de detalhe — enquanto `alimentador-cavaco-briquete-pellets` aponta para `produto-alimentador.html`. A decisão consolidada permite esse formato; `hasDetailPage` registra quando um produto terá página completa.

## 5. Decisões consolidadas antes da Fatia 4.1

1. **Categorias:** seis categorias iniciais — Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores e Acessórios. Novas categorias seguem exigindo aprovação explícita do José; o banco não usa enum fixo.
2. **Página de produto:** produto pode ser apenas card com descrição curta; `hasDetailPage` permanece no modelo para identificar os que terão página completa.
3. **Biomassa:** não é categoria. O alimentador permanece N:N em Equipamentos + Fumicultura; Acessórios é a sexta categoria aprovada.
4. **PostgreSQL local:** a porta permanece fechada no host. Prisma, migrations e seed rodam dentro do serviço `app` pela rede interna do Compose.
5. **Escopo da Fatia 4.1:** não muda para incluir dados pessoais, autenticação, upload real, analytics ou UI; essas regras já consolidadas serão implementadas somente nas fatias dependentes.

## 6. Roadmap de implementação da Fase 3, em fatias

Mesmo padrão incremental já usado na Tarefa 3 (Home). Cada fatia abaixo vira uma proposta própria, no mesmo nível de detalhe desta, com contrato de testes em código, antes de qualquer implementação:

| Fatia | Escopo | Risco/sensibilidade |
|---|---|---|
| **4.1** | Fundação Prisma + `Category`/`Product`/`ProductImage`/`ProductApplication`/`ProductSpecification` — catálogo público | Baixo: nenhum dado sensível, sem autenticação |
| 4.2 | `Region`, relações N:N de cobertura, `Representative`/`RepresentativePrivate`, `Reseller`/`ResellerPrivate` | Alto: dado pessoal, exige `select` explícito, consentimento/revogação e revisão de segurança dedicada |
| 4.3 | Auth.js + `AdminUser` (Admin/Editor) + MFA por e-mail + proteção de tentativas | Alto: autenticação, RBAC e dados de segurança |
| 4.4 | `Article` (CMS) + `AuditLog` | Médio: depende de 4.3 (autor interno) |
| 4.5 | `InstitutionalSettings` + `Banner` | Baixo/médio |

Só a Fatia 4.1 está detalhada e pronta para implementação nesta proposta (seção 7). As demais aguardam este modelo geral ser aprovado primeiro.

## 7. Proposta detalhada — Fatia 4.1 (pronta para o Codex, após sua aprovação do modelo geral)

### 7.1 Escopo incluído

- Adicionar `prisma` e `@prisma/client` a `package.json`.
- `prisma/schema.prisma` com os modelos `Category`, `Product`, `ProductCategory`, `ProductImage`, `ProductApplication`, `ProductSpecification` (código proposto em 7.3).
- Primeira migration (`prisma migrate dev --name fatia_4_1_category_product`).
- `prisma/seed.ts` inserindo as 6 categorias oficiais (upsert idempotente por `slug`).
- Camada de acesso a dados mínima em `src/lib/db/` (`src/lib/db/client.ts` exportando um `PrismaClient` singleton — padrão Next.js recomendado para evitar múltiplas conexões em dev) — **sem** Server Actions, Route Handlers ou UI consumindo isso ainda; é só a fundação.
- Atualização de `docker-compose.yaml`: `DATABASE_URL` e `depends_on: db: condition: service_healthy` no serviço `app` (necessário para o container `app` conseguir rodar `prisma migrate`/conectar).
- Atualização de `.env.example` com `DATABASE_URL` derivada das variáveis já existentes (sem valor real).
- Testes automatizados (contrato completo em 7.5).
- Atualização de `docs/API.md` (nenhuma rota ainda) não é necessária nesta fatia; atualização de `docs/PLANO_MESTRE_FORTSULSC.md` §0.2 (Fase 3 passa de 🔴 para 🟡) fica a cargo da revisão pós-implementação, não desta proposta.

### 7.2 Excluído desta fatia (fica para fatias seguintes ou fora de escopo)

- Qualquer entidade de `Representative`, `Reseller`, `AdminUser`, `Article`, `AuditLog`, `InstitutionalSettings`, `Banner`.
- Autenticação, painel administrativo, upload real para R2 (os campos `imageUrl`/`imageKey` existem no schema, mas nada faz upload ainda).
- Qualquer Route Handler, Server Action ou página pública consumindo os dados — isso é da camada de aplicação, virá depois que o modelo estiver validado.
- Popular os ~10 produtos reais do lançamento — o seed desta fatia só cria as 6 categorias; cadastro de produtos reais depende do painel (Fase 4) ou de um seed adicional aprovado à parte.

### 7.3 `prisma/schema.prisma` proposto

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

Nomes de tabela em `snake_case` via `@@map`/`@map`, seguindo a convenção Postgres já usada como referência em `docs/ARCHITECTURE.md` §10 (`representatives`, `representative_private`).

### 7.4 `docker-compose.yaml` — diff proposto no serviço `app`

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

### 7.5 Contrato de testes proposto (código, conforme exigido a partir da Fase 3)

`src/lib/db/__tests__/fatia-4-1.integration.test.ts` (Vitest, roda contra o Postgres do `db` via rede interna do Compose — ver 7.6 para como executar):

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

### 7.6 Como rodar (dado que o `db` não publica porta no host)

```bash
# subir os serviços
docker compose up -d

# gerar client + aplicar a migration + seed, de dentro do container app
docker compose exec app npx prisma migrate dev --name fatia_4_1_category_product
docker compose exec app npx prisma db seed

# rodar os testes de integração, também de dentro do container
docker compose exec app npm run test:db
```

Novo script sugerido em `package.json`: `"test:db": "vitest run src/lib/db"` e configuração de `"prisma": { "seed": "tsx prisma/seed.ts" }` (ou `ts-node`, a critério do Codex, desde que documentado).

### 7.7 Validações automatizadas e manuais

Automatizadas: `docker compose config --quiet`, `docker compose exec app npx prisma validate`, `docker compose exec app npx prisma migrate dev`, `docker compose exec app npm run test:db` (contrato da seção 7.5), `typecheck`, `next build` (garante que adicionar Prisma não quebra o build da Home já existente).

Manuais, a seu cargo: confirmar que `docker compose up` continua subindo a Home normalmente (nenhuma regressão visual, já que esta fatia não toca em UI); revisar o `schema.prisma` final gerado quanto aos nomes de tabela/coluna.

### 7.8 Riscos e decisões pendentes

- Sem risco de dado sensível ou de negócio: catálogo público, sem PII.
- A Fatia 4.1 não popula produtos reais; portanto, a alteração de conteúdo do alimentador para `equipamentos` + `fumicultura` fica para a fatia aprovada de seed/migração de produtos reais.
- Adicionar `depends_on: condition: service_healthy` no `app` muda o comportamento do `docker compose up` (o `app` agora espera o `db` ficar saudável antes de subir) — mudança pequena e alinhada ao objetivo original da Fase Docker ("rodar em container antes da modelagem, para que schema e migrations já nasçam testáveis").

Proposta de commit atômico ao final: `feat: adicionar fundação Prisma e modelo de catálogo (Fase 3, Fatia 4.1)`.

## 8. Bloco de status

Status: **APROVADA POR JOSE EM 01/09/2026** (modelo geral da seção 3 e decisões consolidadas via `docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md`). Claude fez a revisão técnica desta versão consolidada (seis categorias, `catalogUrl`, escopo da Fatia 4.1 e das Fatias 4.2–4.5 corretamente separados) e não encontrou inconsistência bloqueante. Nenhum código, schema ou migration foi criado por esta proposta. Próximos passos:
1. o Codex implementa a Fatia 4.1 em branch/worktree próprio (`feature/codex-fatia-4-1` ou equivalente), conforme `docs/FortSulSC_instrucoes_Hermes_Codex.md` §6.3;
2. após implementação e testes, Jose traz o resumo para revisão técnica do Claude antes de qualquer merge;
3. commit e push continuam exclusivamente com Jose, após aprovação dupla.

Pendências sinalizadas na revisão do Claude, fora do escopo desta proposta e sem bloquear a Fatia 4.1: (a) migração do conteúdo/UI já implementado do Incremento 5 (`solutions-data.ts`/`SolutionFilters`) para as seis categorias — ver `docs/PLANEJAMENTO_PROJETO.md`, seção "Resolução de conflitos"; (b) o novo componente de abas "A FortSul" (fichário animado, `docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md` item A2) exige proposta técnica própria de UI/frontend e revisão do `ui-reviewer`, por ser mudança visual estrutural não relacionada a esta modelagem de dados; (c) mecanismo de registro de interesse sem dados pessoais (item A5) fica como analytics anônimo (§3.14/I1), sem tabela dedicada nesta fatia, salvo indicação contrária de Jose.

As Fatias 4.2 a 4.5 (seção 6) só serão detalhadas depois que a 4.1 estiver implementada, revisada e aprovada — mantendo o mesmo ritmo incremental já validado na Tarefa 3.
