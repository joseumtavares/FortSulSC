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
    // Filtra pelas seis categorias oficiais (por nome), em vez de assumir que
    // a tabela inteira só contém elas — outras fatias/testes de integração
    // também criam categorias reais (ex.: Fase 4, Fatia 5) na mesma janela.
    const officialSlugs = ['fumicultura', 'equipamentos', 'aviario', 'piscicultura', 'secadores', 'acessorios']
    const categories = await prisma.category.findMany({ where: { slug: { in: officialSlugs } }, orderBy: { order: 'asc' } })
    expect(categories.map((category) => category.slug)).toEqual([
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
        code: 'TEST-MULTI-CATEGORIA',
        name: 'Produto teste',
        categories: { create: [{ categoryId: cat1.id }, { categoryId: cat2.id }] },
      },
      include: { categories: true },
    })
    expect(product.categories).toHaveLength(2)
  })

  it('slug de produto é único', async () => {
    await prisma.product.create({ data: { slug: 'test-produto-unico', code: 'TEST-UNICO-1', name: 'Produto único' } })
    await expect(
      prisma.product.create({ data: { slug: 'test-produto-unico', code: 'TEST-UNICO-2', name: 'Duplicado' } }),
    ).rejects.toThrow()
  })

  it('código de produto é único', async () => {
    await prisma.product.create({ data: { slug: 'test-produto-codigo-1', code: 'TEST-CODIGO-UNICO', name: 'Produto código 1' } })
    await expect(
      prisma.product.create({ data: { slug: 'test-produto-codigo-2', code: 'TEST-CODIGO-UNICO', name: 'Produto código 2' } }),
    ).rejects.toThrow()
  })

  it('produto nasce inativo (active=false) por padrão', async () => {
    const product = await prisma.product.create({
      data: { slug: 'test-produto-draft', code: 'TEST-DRAFT', name: 'Produto rascunho' },
    })
    expect(product.active).toBe(false)
    expect(product.hasDetailPage).toBe(false)
  })

  it('produto pode guardar link público opcional para catálogo PDF', async () => {
    const product = await prisma.product.create({
      data: {
        slug: 'test-produto-catalogo',
        code: 'TEST-CATALOGO',
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
        code: 'TEST-CASCADE',
        name: 'Produto cascade',
        categories: { create: [{ categoryId: category.id }] },
        applications: { create: [{ label: 'Aplicação teste', order: 0 }] },
        specifications: { create: [{ label: 'Spec', value: 'Valor', order: 0 }] },
        images: {
          create: [{
            imageUrl: 'https://r2.example/test.webp',
            imageKey: 'test/test.webp',
            mimeType: 'image/webp',
            size: 1024,
            altText: 'Imagem de teste',
            role: 'GALLERY',
            order: 0,
          }],
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
        code: 'TEST-RESTRICT',
        name: 'Produto restrict',
        categories: { create: [{ categoryId: category.id }] },
      },
    })
    await expect(prisma.category.delete({ where: { id: category.id } })).rejects.toThrow()
  })

  it('imagem de produto exige altText (regra de acessibilidade obrigatória)', async () => {
    const product = await prisma.product.create({ data: { slug: 'test-produto-alt', code: 'TEST-ALT', name: 'Produto alt' } })
    await expect(
      prisma.productImage.create({
        // @ts-expect-error — altText omitido de propósito para provar que o schema recusa a gravação
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
