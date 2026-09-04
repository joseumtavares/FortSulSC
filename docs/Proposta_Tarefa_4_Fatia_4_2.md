# Proposta técnica — Tarefa 4, Fatia 4.2 (hierarquia geográfica IBGE + parceiros unificados)

Status: **DECISÕES DE NEGÓCIO APROVADAS PELO JOSE; SCHEMA/MIGRAÇÃO/TESTES DETALHADOS ABAIXO; IMPLEMENTAÇÃO AINDA NÃO INICIADA.**
Data: 02/09/2026 (revisão 2 — substitui integralmente a revisão 1 desta mesma fatia)

Esta revisão incorpora o aditivo de 02/09/2026 aprovado por Jose (hierarquia geográfica via IBGE, `partners` unificado, UUID em todas as tabelas) e o transforma em schema Prisma completo, estratégia de migração de dados e contrato de testes — pronto para implementação pelo Codex após leitura desta proposta.

## 0. Origem e estado do repositório

- Commit mais recente na `main`: `0b59095 merge: integrar Fatia 4.1 da Fase 3`. A Fatia 4.1 (`Category`/`Product`/`ProductCategory`/`ProductApplication`/`ProductSpecification`/`ProductImage`) está publicada e usa `String @id @default(cuid())` como chave primária — ver `prisma/migrations/20260902213853_fatia_4_1_category_product/migration.sql`.
- Modelo geral da Fase 3 continua aprovado desde 01/09/2026 (`docs/Proposta_Tarefa_4_Fase3_Modelagem.md`). Esta fatia substitui, com aprovação explícita do Jose em 02/09/2026, a modelagem original de `Region`/`Representative`/`Reseller` por: hierarquia `Region → State → Municipality → CommercialArea` alimentada pela API oficial do IBGE, e uma entidade única `Partner` (com `PartnerType`) para representantes e revendas.
- **Decisão registrada sobre nomenclatura (confirmação pedida e obtida do Jose em 02/09/2026):** unificar representante e revenda em uma única tabela `partners`, diferenciada por `PartnerType`, é intencional — mesmo com `docs/PLANEJAMENTO_PROJETO.md` §8 vedando tratar os dois como sinônimo em "interface, cadastro, filtro ou marcador" e a entrevista do cliente (`docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md` linha 446) registrar que "são cadastros e termos diferentes". A unificação ocorre apenas no nível de tabela; `type` é obrigatório e não opcional em nenhuma consulta, e nenhuma fatia futura pode expor "parceiro"/`Partner` como termo substituto de "representante" ou "revenda" em UI, filtro, marcador ou rota pública — sempre exibir o rótulo específico derivado de `type`. Isto fica registrado aqui para as fatias futuras que construírem a UI de busca de parceiros.
- `DATABASE_URL`, `depends_on: db: condition: service_healthy` e o suporte a `prisma`/`vitest` dentro do container `app` já existem desde a Fatia 4.1 — nenhuma mudança em `docker-compose.yaml`, `Dockerfile`, `.env.example` ou `package.json` é necessária nesta fatia. O container `app` já roda em rede bridge com NAT padrão do Docker, então a chamada de saída à API do IBGE (seção 5) deve funcionar sem configuração adicional; validar isso é o único item novo de ambiente desta fatia (seção 8).

## 1. Escopo desta fatia

1. Converter as tabelas já existentes da Fatia 4.1 (`categories`, `products`, `product_categories`, `product_applications`, `product_specifications`, `product_images`) de PK/FK `TEXT` (cuid) para `UUID` nativo, **preservando todos os dados existentes** — sem cast direto `id::uuid` (valor cuid não é UUID válido).
2. Criar a hierarquia geográfica `Region` (macrorregião IBGE) → `State` (UF) → `Municipality`, alimentada pela API de Localidades do IBGE, e `CommercialArea` (agrupamento comercial da FortSul) associada a municípios via tabela de junção.
3. Criar `Partner` (unificando representante/revenda via `PartnerType`), `PartnerPrivate` (1:1, dados sensíveis) e `PartnerCommercialArea` (N:N, cobertura comercial do parceiro).
4. Script de importação idempotente da Região Sul (PR, SC, RS) e seus municípios via API do IBGE, separado do `prisma/seed.ts` padrão (ver seção 5).

Sem autenticação, sem painel administrativo, sem Route Handler/Server Action, sem UI consumindo os dados ainda.

### 1.1 Incluído

- `prisma/schema.prisma`: modelos novos (seção 3) + ajuste de tipo de PK/FK dos modelos da Fatia 4.1.
- Migration com parte manual (conversão UUID, SQL exato na seção 4) + parte gerada (tabelas novas).
- `prisma/seed.ts`: mantém o upsert das seis categorias (agora com UUID gerado pelo Prisma Client, sem mudança de comportamento).
- `scripts/import-ibge-locations.ts`: script novo, executado manualmente (não faz parte de `prisma db seed`), idempotente por `ibgeCode`, limitado a Região Sul/PR/SC/RS e seus municípios (contrato completo na seção 5).
- Testes automatizados (contrato completo na seção 6).

### 1.2 Excluído desta fatia (fica para fatias seguintes, com proposta própria)

- `AdminUser`, `Article`, `AuditLog`, `InstitutionalSettings`, `Banner`, `LoginAttempt` — Fatias 4.3 a 4.5.
- Autenticação, painel administrativo, upload real para R2.
- Qualquer Route Handler, Server Action ou página pública consumindo os dados — quando essa camada existir, é obrigada a usar `select` explícito (nunca retornar o registro completo, nunca incluir a relação com `partner_private`), conforme `docs/RULES.md` e `docs/ARCHITECTURE.md` §10.
- Cadastro real de parceiros (dados verdadeiros de representantes/revendas) — depende do painel ou de um seed adicional aprovado à parte.
- **Nomes de áreas comerciais (`CommercialArea`)**: assim como a lista de regiões não tinha decisão prévia na revisão 1 desta proposta, não existe lista aprovada de áreas comerciais da FortSul (ex.: "Litoral Catarinense", "Serra Gaúcha"). Esta fatia cria a tabela e a associação N:N com município, mas semeia zero áreas comerciais reais — evita inventar nomenclatura de negócio sem aprovação. Fica para quando o painel existir ou para uma decisão pontual sua.
- Enforcement de regra de negócio como "`active=true` exige `consentGivenAt` preenchido" — é regra de aplicação (Server Action + Zod), não constraint de banco; fica para a fatia que implementar as mutações administrativas.

## 2. Por que unificar `Partner` mas manter `PartnerPrivate` separado

Mesmo padrão público/privado da Fatia 4.1 e da modelagem original desta fatia: `partners` guarda só o que já foi aprovado como público na entrevista (linha 738: nome, tipo, região, WhatsApp comercial, redes sociais, link, logotipo, localização aproximada); `partner_private` isola `document` e o registro de consentimento/revogação, nunca incluído por padrão em nenhuma consulta. A unificação em uma tabela não muda essa separação — ela só reduz duplicação de colunas entre o que antes seriam `Representative`/`Reseller` idênticos exceto pelo nome do model.

## 3. `prisma/schema.prisma` completo (modelos novos + ajuste de tipo dos existentes)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== Modelos da Fatia 4.1 — mesmos campos, PK/FK agora UUID nativo =====

model Category {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  products ProductCategory[]

  @@map("categories")
}

model Product {
  id               String   @id @default(uuid()) @db.Uuid
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
  productId  String @map("product_id") @db.Uuid
  categoryId String @map("category_id") @db.Uuid

  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@id([productId, categoryId])
  @@map("product_categories")
}

model ProductApplication {
  id        String @id @default(uuid()) @db.Uuid
  productId String @map("product_id") @db.Uuid
  label     String
  order     Int    @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_applications")
}

model ProductSpecification {
  id        String @id @default(uuid()) @db.Uuid
  productId String @map("product_id") @db.Uuid
  label     String
  value     String
  order     Int    @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_specifications")
}

enum ProductImageRole {
  HERO
  GALLERY
}

model ProductImage {
  id        String           @id @default(uuid()) @db.Uuid
  productId String           @map("product_id") @db.Uuid
  imageUrl  String           @map("image_url")
  imageKey  String           @map("image_key")
  mimeType  String           @map("mime_type")
  size      Int
  altText   String           @map("alt_text")
  role      ProductImageRole @default(GALLERY)
  order     Int              @default(0)
  createdAt DateTime         @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

// ===== Hierarquia geográfica (IBGE) — novos nesta fatia =====

model Region {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  ibgeCode  String   @unique @map("ibge_code")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  states State[]

  @@map("regions")
}

model State {
  id        String   @id @default(uuid()) @db.Uuid
  regionId  String   @map("region_id") @db.Uuid
  name      String
  uf        String   @unique @db.VarChar(2)
  slug      String   @unique
  ibgeCode  String   @unique @map("ibge_code")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  region         Region         @relation(fields: [regionId], references: [id], onDelete: Restrict)
  municipalities Municipality[]

  @@index([regionId])
  @@map("states")
}

model Municipality {
  id        String   @id @default(uuid()) @db.Uuid
  stateId   String   @map("state_id") @db.Uuid
  name      String
  slug      String
  ibgeCode  String   @unique @map("ibge_code")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  state           State                        @relation(fields: [stateId], references: [id], onDelete: Restrict)
  commercialAreas CommercialAreaMunicipality[]

  @@unique([stateId, slug])
  @@index([stateId])
  @@map("municipalities")
}

// ===== Áreas comerciais e parceiros — novos nesta fatia =====

model CommercialArea {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  municipalities CommercialAreaMunicipality[]
  partners       PartnerCommercialArea[]

  @@map("commercial_areas")
}

model CommercialAreaMunicipality {
  commercialAreaId String @map("commercial_area_id") @db.Uuid
  municipalityId   String @map("municipality_id") @db.Uuid

  commercialArea CommercialArea @relation(fields: [commercialAreaId], references: [id], onDelete: Cascade)
  municipality   Municipality   @relation(fields: [municipalityId], references: [id], onDelete: Restrict)

  @@id([commercialAreaId, municipalityId])
  @@map("commercial_area_municipalities")
}

enum PartnerType {
  REPRESENTATIVE
  RESELLER
}

model Partner {
  id             String      @id @default(uuid()) @db.Uuid
  type           PartnerType
  name           String
  description    String?
  whatsapp       String
  socialLinks    Json?       @map("social_links")
  websiteUrl     String?     @map("website_url")
  logoUrl        String?     @map("logo_url")
  active         Boolean     @default(false)
  approximateLat Float?      @map("approximate_lat")
  approximateLng Float?      @map("approximate_lng")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  private         PartnerPrivate?
  commercialAreas PartnerCommercialArea[]

  @@index([type])
  @@map("partners")
}

model PartnerPrivate {
  id               String    @id @default(uuid()) @db.Uuid
  partnerId        String    @unique @map("partner_id") @db.Uuid
  document         String?
  consentGivenAt   DateTime  @map("consent_given_at")
  consentRevokedAt DateTime? @map("consent_revoked_at")
  consentNotes     String?   @map("consent_notes")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  partner Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@map("partner_private")
}

model PartnerCommercialArea {
  partnerId        String @map("partner_id") @db.Uuid
  commercialAreaId String @map("commercial_area_id") @db.Uuid

  partner        Partner        @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  commercialArea CommercialArea @relation(fields: [commercialAreaId], references: [id], onDelete: Restrict)

  @@id([partnerId, commercialAreaId])
  @@map("partner_commercial_areas")
}
```

Notas de campo:

- Nenhum endereço, telefone pessoal, e-mail ou coordenada exata em `Partner` — só `approximateLat`/`approximateLng` (público, aproximado). `document`/consentimento ficam só em `PartnerPrivate`.
- `consentGivenAt` obrigatório (reflete D3 da entrevista: consentimento deve ser registrado antes de publicar); `consentRevokedAt` opcional, desativação em até 24h é responsabilidade de fatia futura de admin.
- `active` nasce `false` por padrão, mesmo padrão de `Product`.
- `onDelete: Restrict` em toda a cadeia geográfica (`State→Region`, `Municipality→State`, `CommercialAreaMunicipality→Municipality`, `PartnerCommercialArea→CommercialArea`) — não é possível apagar um nível da hierarquia enquanto houver algo abaixo dependendo dele, mesmo padrão já usado em `ProductCategory→Category`.
- `@db.Uuid` em todas as PKs/FKs — tipo nativo Postgres `uuid`, não apenas string formatada como UUID.

## 4. Migração dos dados existentes: CUID (TEXT) → UUID nativo

`prisma migrate dev` não sabe gerar esse diff sozinho — ele tentaria `ALTER COLUMN "id" TYPE UUID USING "id"::uuid`, que falha porque valores cuid (ex.: `clh3am9xa0000...`) não são UUID válido. A migration desta fatia precisa ser criada com `prisma migrate dev --create-only --name fatia_4_2_uuid_and_partners` e ter o SQL abaixo colado no início do arquivo gerado (a parte de criação das tabelas novas pode continuar gerada automaticamente pelo Prisma a partir do schema da seção 3).

Estratégia: para cada tabela com PK própria, criar coluna UUID nova com `gen_random_uuid()` (disponível nativamente desde PostgreSQL 13, sem precisar de `CREATE EXTENSION`), preencher as FKs das tabelas filhas fazendo `JOIN` pela chave antiga, só então derrubar as colunas/constraints antigas e renomear as novas para o nome definitivo. Nenhum dado é perdido; nenhuma linha é recriada — os UUIDs são novos, mas o conteúdo e os relacionamentos são preservados.

```sql
-- ===== 1) Colunas UUID novas nas tabelas com PK própria =====
ALTER TABLE "categories" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "products" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_applications" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_specifications" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "product_images" ADD COLUMN "id_new" UUID NOT NULL DEFAULT gen_random_uuid();

-- ===== 2) Colunas de FK novas (ainda nulas) nas tabelas filhas =====
ALTER TABLE "product_categories" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_categories" ADD COLUMN "category_id_new" UUID;
ALTER TABLE "product_applications" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_specifications" ADD COLUMN "product_id_new" UUID;
ALTER TABLE "product_images" ADD COLUMN "product_id_new" UUID;

-- ===== 3) Remapear FKs usando os UUIDs recém-gerados =====
UPDATE "product_categories" pc SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pc."product_id";
UPDATE "product_categories" pc SET "category_id_new" = c."id_new" FROM "categories" c WHERE c."id" = pc."category_id";
UPDATE "product_applications" pa SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pa."product_id";
UPDATE "product_specifications" ps SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = ps."product_id";
UPDATE "product_images" pi SET "product_id_new" = p."id_new" FROM "products" p WHERE p."id" = pi."product_id";

-- ===== 4) Tornar as novas FKs obrigatórias =====
ALTER TABLE "product_categories" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_categories" ALTER COLUMN "category_id_new" SET NOT NULL;
ALTER TABLE "product_applications" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_specifications" ALTER COLUMN "product_id_new" SET NOT NULL;
ALTER TABLE "product_images" ALTER COLUMN "product_id_new" SET NOT NULL;

-- ===== 5) Derrubar constraints antigas (FKs antes, PKs depois) =====
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_product_id_fkey";
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_category_id_fkey";
ALTER TABLE "product_applications" DROP CONSTRAINT "product_applications_product_id_fkey";
ALTER TABLE "product_specifications" DROP CONSTRAINT "product_specifications_product_id_fkey";
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";

ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_pkey";
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey";
ALTER TABLE "products" DROP CONSTRAINT "products_pkey";
ALTER TABLE "product_applications" DROP CONSTRAINT "product_applications_pkey";
ALTER TABLE "product_specifications" DROP CONSTRAINT "product_specifications_pkey";
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_pkey";

-- ===== 6) Derrubar colunas antigas e renomear as novas para o nome definitivo =====
ALTER TABLE "categories" DROP COLUMN "id";
ALTER TABLE "categories" RENAME COLUMN "id_new" TO "id";

ALTER TABLE "products" DROP COLUMN "id";
ALTER TABLE "products" RENAME COLUMN "id_new" TO "id";

ALTER TABLE "product_categories" DROP COLUMN "product_id";
ALTER TABLE "product_categories" DROP COLUMN "category_id";
ALTER TABLE "product_categories" RENAME COLUMN "product_id_new" TO "product_id";
ALTER TABLE "product_categories" RENAME COLUMN "category_id_new" TO "category_id";

ALTER TABLE "product_applications" DROP COLUMN "id";
ALTER TABLE "product_applications" DROP COLUMN "product_id";
ALTER TABLE "product_applications" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_applications" RENAME COLUMN "product_id_new" TO "product_id";

ALTER TABLE "product_specifications" DROP COLUMN "id";
ALTER TABLE "product_specifications" DROP COLUMN "product_id";
ALTER TABLE "product_specifications" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_specifications" RENAME COLUMN "product_id_new" TO "product_id";

ALTER TABLE "product_images" DROP COLUMN "id";
ALTER TABLE "product_images" DROP COLUMN "product_id";
ALTER TABLE "product_images" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "product_images" RENAME COLUMN "product_id_new" TO "product_id";

-- ===== 7) Recriar PKs/FKs com os mesmos nomes de constraint de antes =====
ALTER TABLE "categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");
ALTER TABLE "products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id", "category_id");
ALTER TABLE "product_applications" ADD CONSTRAINT "product_applications_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id");
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_applications" ADD CONSTRAINT "product_applications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== 8) Default para inserts futuros fora do Prisma Client (ex.: SQL direto) =====
ALTER TABLE "categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_applications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_specifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product_images" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- ===== 9) A partir daqui, `prisma migrate dev` gera automaticamente as tabelas novas:
-- regions, states, municipalities, commercial_areas, commercial_area_municipalities,
-- partners, partner_private, partner_commercial_areas — sem necessidade de SQL manual,
-- pois são tabelas novas, sem dado legado para preservar.
```

**Validação obrigatória desta migração antes de considerar a fatia pronta:** rodar o `docker compose exec app npx prisma db seed` da Fatia 4.1 (categorias + qualquer produto de teste que exista) **antes** de aplicar esta migration, anotar os `slug`s e relações existentes, aplicar a migration, e confirmar que todas as linhas de `categories`/`products`/`product_categories`/`product_applications`/`product_specifications`/`product_images` continuam presentes com os mesmos `slug`/`label`/`value`/`alt_text` e as mesmas relações — só o `id` muda de formato. Isso não é coberto pelos testes Vitest da seção 6 (que rodam contra uma migration já aplicada do zero); é uma validação manual/scriptada específica de migração de dado legado.

## 5. Importação de localidades via API do IBGE

Fonte oficial: [API de Localidades do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades). Identificadores do IBGE são armazenados em `ibge_code` como identificador externo único, nunca substituindo o UUID interno.

Script novo `scripts/import-ibge-locations.ts`, executado manualmente (**não** faz parte de `prisma db seed`, para que o seed padrão — usado pelos testes automatizados — continue funcionando offline, sem depender de rede):

```bash
docker compose exec app npx tsx scripts/import-ibge-locations.ts
```

Contrato do script:

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const UFS = ['PR', 'SC', 'RS'] as const

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function importRegionSul() {
  const estadosRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
  if (!estadosRes.ok) throw new Error(`IBGE /estados retornou ${estadosRes.status}`)
  const estados = await estadosRes.json()
  const estadosSul = estados.filter((estado: any) => UFS.includes(estado.sigla))

  for (const estado of estadosSul) {
    const region = await prisma.region.upsert({
      where: { ibgeCode: String(estado.regiao.id) },
      update: { name: estado.regiao.nome },
      create: {
        ibgeCode: String(estado.regiao.id),
        name: estado.regiao.nome,
        slug: slugify(estado.regiao.nome),
      },
    })

    const state = await prisma.state.upsert({
      where: { ibgeCode: String(estado.id) },
      update: { name: estado.nome, uf: estado.sigla },
      create: {
        ibgeCode: String(estado.id),
        name: estado.nome,
        uf: estado.sigla,
        slug: slugify(estado.nome),
        regionId: region.id,
      },
    })

    const municipiosRes = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios`,
    )
    if (!municipiosRes.ok) throw new Error(`IBGE /municipios de ${estado.sigla} retornou ${municipiosRes.status}`)
    const municipios = await municipiosRes.json()

    for (const municipio of municipios) {
      await prisma.municipality.upsert({
        where: { ibgeCode: String(municipio.id) },
        update: { name: municipio.nome },
        create: {
          ibgeCode: String(municipio.id),
          name: municipio.nome,
          slug: slugify(municipio.nome),
          stateId: state.id,
        },
      })
    }

    console.log(`Importado: ${estado.nome} (${municipios.length} municípios)`)
  }
}

importRegionSul()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```

Regras:

- Idempotente: `upsert` por `ibgeCode`, pode rodar quantas vezes for preciso sem duplicar.
- Limitado a Região Sul / PR / SC / RS nesta fatia — ampliar para outros estados é decisão futura, não desta proposta.
- A API não é consultada em tempo de request público — o site sempre lê do PostgreSQL local. Este script roda uma vez (ou sob demanda futura), nunca a cada acesso.
- Sem dado inventado de parceiro — o script só popula `regions`/`states`/`municipalities`, nunca `partners`.
- Falha explícita (`throw`) se a API do IBGE responder erro, em vez de continuar silenciosamente com dado parcial.

## 6. Contrato de testes (código)

`src/lib/db/__tests__/fatia-4-2.integration.test.ts` — roda contra o Postgres do `db` via `docker compose exec app npm run test:db`. Os testes **não** chamam a API do IBGE (evita dependência de rede/flakiness); criam a hierarquia geográfica manualmente com dados de teste, exatamente como a Fatia 4.1 fez para categorias/produtos.

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Fase 3 — Fatia 4.2: hierarquia geográfica + parceiros unificados', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.partnerCommercialArea.deleteMany({ where: { partner: { name: { startsWith: 'Teste ' } } } })
    await prisma.partnerPrivate.deleteMany({ where: { partner: { name: { startsWith: 'Teste ' } } } })
    await prisma.partner.deleteMany({ where: { name: { startsWith: 'Teste ' } } })
    await prisma.commercialAreaMunicipality.deleteMany({ where: { commercialArea: { slug: { startsWith: 'test-' } } } })
    await prisma.commercialArea.deleteMany({ where: { slug: { startsWith: 'test-' } } })
    await prisma.municipality.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.state.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.region.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.$disconnect()
  })

  async function createTestHierarchy(suffix: string) {
    const region = await prisma.region.create({
      data: { name: `Teste Região ${suffix}`, slug: `test-regiao-${suffix}`, ibgeCode: `test-region-${suffix}` },
    })
    const state = await prisma.state.create({
      data: {
        name: `Teste Estado ${suffix}`,
        uf: suffix.slice(0, 2).toUpperCase(),
        slug: `test-estado-${suffix}`,
        ibgeCode: `test-state-${suffix}`,
        regionId: region.id,
      },
    })
    const municipality = await prisma.municipality.create({
      data: {
        name: `Teste Município ${suffix}`,
        slug: `test-municipio-${suffix}`,
        ibgeCode: `test-municipality-${suffix}`,
        stateId: state.id,
      },
    })
    return { region, state, municipality }
  }

  it('ibgeCode de região é único', async () => {
    await createTestHierarchy('uniq-region')
    await expect(
      prisma.region.create({
        data: { name: 'Duplicada', slug: 'test-regiao-dup', ibgeCode: 'test-region-uniq-region' },
      }),
    ).rejects.toThrow()
  })

  it('uf e ibgeCode de estado são únicos', async () => {
    const { region } = await createTestHierarchy('uniq-state')
    await expect(
      prisma.state.create({
        data: { name: 'Dup', uf: 'UN', slug: 'test-estado-dup', ibgeCode: 'test-state-uniq-state', regionId: region.id },
      }),
    ).rejects.toThrow()
  })

  it('ibgeCode de município é único', async () => {
    const { state } = await createTestHierarchy('uniq-mun')
    await expect(
      prisma.municipality.create({
        data: { name: 'Dup', slug: 'test-municipio-dup', ibgeCode: 'test-municipality-uniq-mun', stateId: state.id },
      }),
    ).rejects.toThrow()
  })

  it('área comercial pode cobrir mais de um município (N:N)', async () => {
    const h1 = await createTestHierarchy('area-a')
    const h2 = await createTestHierarchy('area-b')
    const area = await prisma.commercialArea.create({
      data: {
        name: 'Teste Área Comercial',
        slug: 'test-area-multi-municipio',
        municipalities: {
          create: [{ municipalityId: h1.municipality.id }, { municipalityId: h2.municipality.id }],
        },
      },
      include: { municipalities: true },
    })
    expect(area.municipalities).toHaveLength(2)
  })

  it('parceiro do tipo REPRESENTATIVE é criado com o type correto', async () => {
    const partner = await prisma.partner.create({
      data: { type: 'REPRESENTATIVE', name: 'Teste Representante', whatsapp: '5511999999999' },
    })
    expect(partner.type).toBe('REPRESENTATIVE')
  })

  it('parceiro do tipo RESELLER é criado com o type correto', async () => {
    const partner = await prisma.partner.create({
      data: { type: 'RESELLER', name: 'Teste Revenda', whatsapp: '5511999999998' },
    })
    expect(partner.type).toBe('RESELLER')
  })

  it('parceiro nasce inativo (active=false) por padrão', async () => {
    const partner = await prisma.partner.create({
      data: { type: 'REPRESENTATIVE', name: 'Teste Parceiro Rascunho', whatsapp: '5511999999997' },
    })
    expect(partner.active).toBe(false)
  })

  it('dados privados do parceiro exigem consentGivenAt (obrigatório)', async () => {
    const partner = await prisma.partner.create({
      data: { type: 'RESELLER', name: 'Teste Parceiro Consentimento', whatsapp: '5511999999996' },
    })
    await expect(
      prisma.partnerPrivate.create({
        // @ts-expect-error — consentGivenAt omitido de propósito para provar que o schema recusa a gravação
        data: { partnerId: partner.id },
      }),
    ).rejects.toThrow()
  })

  it('partner_private é 1:1 — segundo registro para o mesmo parceiro falha', async () => {
    const partner = await prisma.partner.create({
      data: { type: 'REPRESENTATIVE', name: 'Teste Parceiro Único', whatsapp: '5511999999995' },
    })
    await prisma.partnerPrivate.create({ data: { partnerId: partner.id, consentGivenAt: new Date() } })
    await expect(
      prisma.partnerPrivate.create({ data: { partnerId: partner.id, consentGivenAt: new Date() } }),
    ).rejects.toThrow()
  })

  it('parceiro pode cobrir mais de uma área comercial (N:N)', async () => {
    const area1 = await prisma.commercialArea.create({ data: { name: 'A1', slug: 'test-area-cov-1' } })
    const area2 = await prisma.commercialArea.create({ data: { name: 'A2', slug: 'test-area-cov-2' } })
    const partner = await prisma.partner.create({
      data: {
        type: 'RESELLER',
        name: 'Teste Parceiro Multi Área',
        whatsapp: '5511999999994',
        commercialAreas: { create: [{ commercialAreaId: area1.id }, { commercialAreaId: area2.id }] },
      },
      include: { commercialAreas: true },
    })
    expect(partner.commercialAreas).toHaveLength(2)
  })

  it('excluir parceiro remove em cascata dados privados e vínculos de área comercial', async () => {
    const area = await prisma.commercialArea.create({ data: { name: 'Cascade', slug: 'test-area-cascade' } })
    const partner = await prisma.partner.create({
      data: {
        type: 'REPRESENTATIVE',
        name: 'Teste Parceiro Cascade',
        whatsapp: '5511999999993',
        commercialAreas: { create: [{ commercialAreaId: area.id }] },
        private: { create: { consentGivenAt: new Date() } },
      },
    })

    await prisma.partner.delete({ where: { id: partner.id } })

    const [privateRows, areaLinks] = await Promise.all([
      prisma.partnerPrivate.findMany({ where: { partnerId: partner.id } }),
      prisma.partnerCommercialArea.findMany({ where: { partnerId: partner.id } }),
    ])
    expect([privateRows, areaLinks].every((rows) => rows.length === 0)).toBe(true)
  })

  it('não permite excluir área comercial referenciada por parceiro (onDelete: Restrict)', async () => {
    const area = await prisma.commercialArea.create({ data: { name: 'Restrict', slug: 'test-area-restrict' } })
    await prisma.partner.create({
      data: {
        type: 'RESELLER',
        name: 'Teste Parceiro Restrict Área',
        whatsapp: '5511999999992',
        commercialAreas: { create: [{ commercialAreaId: area.id }] },
      },
    })
    await expect(prisma.commercialArea.delete({ where: { id: area.id } })).rejects.toThrow()
  })

  it('não permite excluir município referenciado por área comercial (onDelete: Restrict)', async () => {
    const { municipality } = await createTestHierarchy('restrict-mun')
    await prisma.commercialArea.create({
      data: {
        name: 'Restrict Mun',
        slug: 'test-area-restrict-mun',
        municipalities: { create: [{ municipalityId: municipality.id }] },
      },
    })
    await expect(prisma.municipality.delete({ where: { id: municipality.id } })).rejects.toThrow()
  })

  it('não permite excluir estado referenciado por município (onDelete: Restrict)', async () => {
    const { state } = await createTestHierarchy('restrict-state')
    await expect(prisma.state.delete({ where: { id: state.id } })).rejects.toThrow()
  })

  it('não permite excluir região referenciada por estado (onDelete: Restrict)', async () => {
    const { region } = await createTestHierarchy('restrict-region')
    await expect(prisma.region.delete({ where: { id: region.id } })).rejects.toThrow()
  })
})
```

15 testes cobrindo: unicidade de `ibgeCode` em cada nível da hierarquia, N:N área comercial × município, `type` de `Partner` correto para os dois valores do enum, `active=false` por padrão, `consentGivenAt` obrigatório, unicidade 1:1 de `partner_private`, N:N parceiro × área comercial, cascade de exclusão de parceiro, e restrict em cada nível da hierarquia geográfica (área comercial→município→estado→região).

## 7. `docker-compose.yaml`, `Dockerfile`, `.env.example`, `package.json`

Sem alteração de configuração. Único item a confirmar (não é mudança de arquivo, é validação de ambiente): o container `app` precisa alcançar `servicodados.ibge.gov.br` na porta 443 ao rodar `scripts/import-ibge-locations.ts` — o Compose não bloqueia egress por padrão, mas ambientes com proxy/firewall corporativo podem precisar de ajuste fora do repositório.

## 8. Como rodar

```bash
docker compose up -d

# Migration (inclui a conversão UUID manual da seção 4 + tabelas novas)
docker compose exec app npx prisma migrate dev --create-only --name fatia_4_2_uuid_and_partners
```

O arquivo gerado por `--create-only` vai conter DOIS tipos de trecho: (a) um diff automático tentando alterar `categories`/`products`/`product_categories`/`product_applications`/`product_specifications`/`product_images` (tabelas já existentes) — **esse trecho deve ser apagado por completo**, nunca só ter o SQL manual colado antes dele, porque o Prisma tentaria `ALTER COLUMN "id" TYPE UUID USING "id"::uuid` (falha, cuid não é UUID válido) e/ou recriar as mesmas constraints que o bloco manual já recria, causando erro de constraint duplicada; (b) `CREATE TYPE "PartnerType"` e os `CREATE TABLE` das oito entidades novas (`regions`, `states`, `municipalities`, `commercial_areas`, `commercial_area_municipalities`, `partners`, `partner_private`, `partner_commercial_areas`) — **esse trecho deve ser mantido como o Prisma gerou**. Resultado final do arquivo: SQL manual da seção 4 (partes 1-9) seguido só do trecho (b) do diff automático. Confirmar com `docker compose exec app npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script` ou revisão manual do arquivo antes de aplicar.

Backup recomendado antes de aplicar, por ser a primeira migration a alterar tabela já em `main`: `docker compose exec db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > backup-pre-fatia-4-2.sql` (as variáveis são resolvidas dentro do container, onde `POSTGRES_USER`/`POSTGRES_DB` já existem via `docker-compose.yaml`; rodar fora do container e salvar fora do repositório).

```bash
docker compose exec app npx prisma migrate dev

docker compose exec app npx prisma db seed

# Importação de localidades (manual, fora do seed padrão)
docker compose exec app npx tsx scripts/import-ibge-locations.ts

docker compose exec app npm run test:db
```

## 9. Validações automatizadas e manuais

Automatizadas: `docker compose config --quiet`, `docker compose exec app npx prisma validate`, `docker compose exec app npx prisma migrate dev`, `docker compose exec app npm run test:db` (contrato da seção 6), `typecheck`, `next build`.

Manuais, a cargo de Jose: validação de preservação de dados na migração UUID (seção 4, obrigatória); rodar `scripts/import-ibge-locations.ts` e conferir no banco que PR/SC/RS e seus municípios foram importados com `ibgeCode` correto; confirmar que `docker compose up` continua subindo a Home normalmente (esta fatia não toca em UI).

## 10. Riscos

- **Migração de dado legado**: esta é a primeira fatia que altera tabelas já mergeadas em `main` (Fatia 4.1). O SQL da seção 4 preserva dados por construção (gera UUID novo por linha e remapeia FK antes de trocar o tipo), mas exige a validação manual descrita na seção 4/9 antes de aceitar a fatia como concluída — testes Vitest sozinhos não cobrem esse cenário porque rodam contra uma migration já aplicada do zero.
- **Dependência de rede externa (API do IBGE)**: só afeta o script de importação manual, nunca o site público ou os testes automatizados (que não chamam a API). Se a API do IBGE mudar de formato de resposta no futuro, só o script de importação quebra, não o schema.
- Mesma observação de sensibilidade da revisão 1: sem rota pública nem admin consumindo os dados nesta fatia, o risco de exposição de `partner_private` é zero — não há como consultar de fora do container.
- Sem enforcement de banco para "`active=true` exige consentimento válido" — fica documentado como obrigação da fatia que implementar mutações administrativas.
- Nenhuma área comercial real é semeada (decisão de negócio pendente, mesma lógica da lista de regiões na revisão 1) — schema e migration seguem válidos sem isso.

Proposta de commit atômico ao final: `feat: adicionar hierarquia geografica IBGE e parceiros unificados (Fase 3, Fatia 4.2)`.

## 11. Bloco de status

Status: **DECISÕES DE NEGÓCIO APROVADAS PELO JOSE EM 02/09/2026** (hierarquia geográfica via IBGE, `partners` unificado com `PartnerType`, UUID em todas as tabelas incluindo as da Fatia 4.1). Schema, estratégia de migração e contrato de testes detalhados nesta proposta. **Implementação ainda não iniciada.**

Fluxo a partir daqui:
1. Codex implementa em branch/worktree próprio (`feature/codex-fatia-4-2` ou equivalente), seguindo exatamente o schema (seção 3), o SQL de migração (seção 4) e o script de importação (seção 5) desta proposta;
2. após implementação e validações (seção 9, incluindo a validação manual de preservação de dados), Jose traz o resultado para revisão técnica do Claude;
3. dado que esta fatia altera tabelas já em produção/`main` e envolve dado pessoal, a revisão do Claude deve checar explicitamente: (a) preservação de dados na migração UUID, (b) separação pública/privada de `Partner`/`PartnerPrivate` sem vazamento, (c) que nenhuma UI/rota futura funda "representante" e "revenda" sob o rótulo genérico "parceiro";
4. commit, merge e push continuam exclusivamente com o Jose.

Referência completa do modelo geral da Fase 3 (todas as entidades, roadmap 4.1-4.5): `docs/Proposta_Tarefa_4_Fase3_Modelagem.md`.
