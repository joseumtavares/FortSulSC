import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { listActiveCategoriesPublic } from '@/lib/content/category-repository'
import { listActiveProductsPublic } from '@/lib/content/product-repository'

const prisma = new PrismaClient()

// Prefixo exclusivo (não `test-cat-`/`TEST-` genéricos) para nunca colidir
// com a limpeza de outro arquivo de teste rodando na mesma janela.
const PREFIX = 'testfatia45'

describe('Fase 4 — Fatia 5: cascata de visibilidade Categoria/Produto', () => {
  let activeCategoryId: string
  let inactiveCategoryId: string

  beforeAll(async () => {
    await prisma.$connect()

    const [active, inactive] = await Promise.all([
      prisma.category.create({ data: { name: 'Teste Fatia 5 Ativa', slug: `${PREFIX}-cat-ativa`, order: 900, active: true } }),
      prisma.category.create({ data: { name: 'Teste Fatia 5 Inativa', slug: `${PREFIX}-cat-inativa`, order: 901, active: false } }),
    ])
    activeCategoryId = active.id
    inactiveCategoryId = inactive.id
  })

  afterAll(async () => {
    await prisma.productCategory.deleteMany({ where: { product: { code: { startsWith: PREFIX } } } })
    await prisma.product.deleteMany({ where: { code: { startsWith: PREFIX } } })
    await prisma.category.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    await prisma.$disconnect()
  })

  it('categoria nasce ativa por padrão', async () => {
    const category = await prisma.category.create({ data: { name: 'Teste Fatia 5 Padrão', slug: `${PREFIX}-cat-padrao`, order: 902 } })
    expect(category.active).toBe(true)
  })

  it('categoria inativa nunca aparece na consulta pública', async () => {
    const categories = await listActiveCategoriesPublic()
    expect(categories.some((category) => category.id === inactiveCategoryId)).toBe(false)
    expect(categories.some((category) => category.id === activeCategoryId)).toBe(true)
  })

  it('produto ativo em categoria inativa não aparece em lugar nenhum', async () => {
    const product = await prisma.product.create({
      data: {
        code: `${PREFIX}-so-inativa`,
        slug: `${PREFIX}-produto-so-inativa`,
        name: 'Produto só em categoria inativa',
        active: true,
        categories: { create: [{ categoryId: inactiveCategoryId }] },
      },
    })

    const publicProducts = await listActiveProductsPublic()
    expect(publicProducts.some((item) => item.id === product.id)).toBe(false)
  })

  it('produto ativo em duas categorias, uma ativa e uma inativa, aparece só na ativa', async () => {
    const product = await prisma.product.create({
      data: {
        code: `${PREFIX}-misto`,
        slug: `${PREFIX}-produto-misto`,
        name: 'Produto misto',
        active: true,
        categories: { create: [{ categoryId: activeCategoryId }, { categoryId: inactiveCategoryId }] },
      },
    })

    const publicProducts = await listActiveProductsPublic()
    const found = publicProducts.find((item) => item.id === product.id)
    expect(found).toBeDefined()
    expect(found?.categories.map((link) => link.category.slug)).toEqual([`${PREFIX}-cat-ativa`])
  })

  it('produto inativo nunca aparece mesmo com categoria ativa', async () => {
    const product = await prisma.product.create({
      data: {
        code: `${PREFIX}-inativo`,
        slug: `${PREFIX}-produto-inativo`,
        name: 'Produto inativo',
        active: false,
        categories: { create: [{ categoryId: activeCategoryId }] },
      },
    })

    const publicProducts = await listActiveProductsPublic()
    expect(publicProducts.some((item) => item.id === product.id)).toBe(false)
  })

  it('código de produto é único no banco', async () => {
    await prisma.product.create({ data: { code: `${PREFIX}-codigo-db`, slug: `${PREFIX}-produto-codigo-db-1`, name: 'Produto 1' } })
    await expect(
      prisma.product.create({ data: { code: `${PREFIX}-codigo-db`, slug: `${PREFIX}-produto-codigo-db-2`, name: 'Produto 2' } }),
    ).rejects.toThrow()
  })

  it('excluir produto remove em cascata os depoimentos', async () => {
    const product = await prisma.product.create({
      data: {
        code: `${PREFIX}-depoimento`,
        slug: `${PREFIX}-produto-depoimento`,
        name: 'Produto com depoimento',
        testimonials: { create: [{ platform: 'TIKTOK', url: 'https://tiktok.com/@x/video/1' }] },
      },
    })

    await prisma.product.delete({ where: { id: product.id } })

    const testimonials = await prisma.productTestimonial.findMany({ where: { productId: product.id } })
    expect(testimonials).toHaveLength(0)
  })
})
