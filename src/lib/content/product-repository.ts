import { prisma } from '@/lib/db/client'
import { slugify } from './slug'

export type ProductTextInput = {
  code: string
  name: string
  eyebrow: string | null
  shortDescription: string | null
  description: string | null
  catalogUrl: string | null
  whatsappMessageTemplate: string | null
}

/**
 * Deriva um slug único a partir do nome, tentando o valor base primeiro e
 * acrescentando um sufixo numérico só se já existir outro produto com o
 * mesmo slug — mesmo padrão de `generateUniqueArticleSlug`.
 */
export async function generateUniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name) || 'produto'
  let candidate = base
  let suffix = 2

  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export function listProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
    include: { categories: { include: { category: true } } },
  })
}

export function findProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      applications: { orderBy: { order: 'asc' } },
      specifications: { orderBy: { order: 'asc' } },
      images: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
    },
  })
}

export async function createProduct(input: ProductTextInput) {
  const slug = await generateUniqueProductSlug(input.name)
  return prisma.product.create({ data: { ...input, slug } })
}

export function updateProduct(id: string, input: ProductTextInput) {
  return prisma.product.update({ where: { id }, data: input })
}

export function updateProductActive(id: string, active: boolean) {
  return prisma.product.update({ where: { id }, data: { active } })
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } })
}

/** Substitui todos os vínculos de categoria do produto de uma vez. */
export function setProductCategories(id: string, categoryIds: string[]) {
  return prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { productId: id } }),
    prisma.productCategory.createMany({ data: categoryIds.map((categoryId) => ({ productId: id, categoryId })) }),
  ])
}

/** Substitui a lista inteira de aplicações do produto de uma vez. */
export function setProductApplications(id: string, applications: { label: string; order: number }[]) {
  return prisma.$transaction([
    prisma.productApplication.deleteMany({ where: { productId: id } }),
    prisma.productApplication.createMany({ data: applications.map((application) => ({ ...application, productId: id })) }),
  ])
}

/** Substitui a lista inteira de especificações do produto de uma vez. */
export function setProductSpecifications(id: string, specifications: { label: string; value: string; order: number }[]) {
  return prisma.$transaction([
    prisma.productSpecification.deleteMany({ where: { productId: id } }),
    prisma.productSpecification.createMany({ data: specifications.map((specification) => ({ ...specification, productId: id })) }),
  ])
}

/**
 * Consulta pública: só produto ativo com pelo menos uma categoria ativa
 * vinculada (categoria desativada esconde o produto só ali — se todas as
 * categorias do produto estiverem inativas, ele não aparece em lugar
 * nenhum). Seleção explícita de campos: nunca `imageKey`/`mimeType`/`size`
 * nem qualquer detalhe interno de storage (mesmo cuidado já corrigido em
 * `findActiveBannersPublic`).
 */
export function listActiveProductsPublic() {
  return prisma.product.findMany({
    where: { active: true, categories: { some: { category: { active: true } } } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      slug: true,
      code: true,
      name: true,
      eyebrow: true,
      shortDescription: true,
      description: true,
      catalogUrl: true,
      whatsappMessageTemplate: true,
      categories: {
        where: { category: { active: true } },
        select: { category: { select: { slug: true } } },
      },
      applications: { orderBy: { order: 'asc' }, select: { label: true } },
      specifications: { orderBy: { order: 'asc' }, select: { label: true, value: true } },
      images: { orderBy: { order: 'asc' }, select: { imageUrl: true, altText: true, role: true } },
      testimonials: { orderBy: { order: 'asc' }, select: { platform: true, url: true, authorName: true } },
    },
  })
}
