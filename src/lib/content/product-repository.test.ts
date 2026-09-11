import { beforeEach, describe, expect, it, vi } from 'vitest'

const productMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))
const productCategoryMock = vi.hoisted(() => ({ deleteMany: vi.fn(), createMany: vi.fn() }))
const productApplicationMock = vi.hoisted(() => ({ deleteMany: vi.fn(), createMany: vi.fn() }))
const productSpecificationMock = vi.hoisted(() => ({ deleteMany: vi.fn(), createMany: vi.fn() }))
const transactionMock = vi.hoisted(() => vi.fn((operations: unknown[]) => Promise.resolve(operations)))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    product: productMock,
    productCategory: productCategoryMock,
    productApplication: productApplicationMock,
    productSpecification: productSpecificationMock,
    $transaction: transactionMock,
  },
}))

import {
  createProduct,
  deleteProduct,
  findProductForAdmin,
  generateUniqueProductSlug,
  listActiveProductsPublic,
  listProductsForAdmin,
  setProductApplications,
  setProductCategories,
  setProductSpecifications,
  updateProduct,
  updateProductActive,
} from './product-repository'

describe('product-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation((operations: unknown[]) => Promise.resolve(operations))
  })

  it('generates the base slug when it is free', async () => {
    productMock.findUnique.mockResolvedValueOnce(null)
    expect(await generateUniqueProductSlug('Alimentador de Cavaco')).toBe('alimentador-de-cavaco')
  })

  it('appends a numeric suffix on slug collision', async () => {
    productMock.findUnique.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null)
    expect(await generateUniqueProductSlug('Queimador')).toBe('queimador-2')
  })

  it('creates product with a generated slug', async () => {
    productMock.findUnique.mockResolvedValueOnce(null)
    productMock.create.mockResolvedValueOnce({ id: 'p1' })
    const input = { code: 'ALM-001', name: 'Alimentador', eyebrow: null, shortDescription: null, description: null, catalogUrl: null, whatsappMessageTemplate: null }

    await createProduct(input)

    expect(productMock.create).toHaveBeenCalledWith({ data: { ...input, slug: 'alimentador' } })
  })

  it('lists products for admin with categories included', async () => {
    await listProductsForAdmin()
    expect(productMock.findMany).toHaveBeenCalledWith({
      orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
      include: { categories: { include: { category: true } } },
    })
  })

  it('finds product for admin with all sub-resources included', async () => {
    await findProductForAdmin('p1')
    expect(productMock.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p1' } }),
    )
  })

  it('updates product text fields', async () => {
    const input = { code: 'ALM-002', name: 'Novo nome', eyebrow: null, shortDescription: null, description: null, catalogUrl: null, whatsappMessageTemplate: null }
    await updateProduct('p1', input)
    expect(productMock.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: input })
  })

  it('updates only active', async () => {
    await updateProductActive('p1', true)
    expect(productMock.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { active: true } })
  })

  it('deletes product by id', async () => {
    await deleteProduct('p1')
    expect(productMock.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
  })

  it('replaces category links atomically', async () => {
    await setProductCategories('p1', ['cat-1', 'cat-2'])
    expect(transactionMock).toHaveBeenCalled()
    expect(productCategoryMock.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } })
    expect(productCategoryMock.createMany).toHaveBeenCalledWith({
      data: [{ productId: 'p1', categoryId: 'cat-1' }, { productId: 'p1', categoryId: 'cat-2' }],
    })
  })

  it('replaces applications atomically', async () => {
    await setProductApplications('p1', [{ label: 'Uso 1', order: 0 }])
    expect(productApplicationMock.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } })
    expect(productApplicationMock.createMany).toHaveBeenCalledWith({ data: [{ label: 'Uso 1', order: 0, productId: 'p1' }] })
  })

  it('replaces specifications atomically', async () => {
    await setProductSpecifications('p1', [{ label: 'Potência', value: '5 HP', order: 0 }])
    expect(productSpecificationMock.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } })
    expect(productSpecificationMock.createMany).toHaveBeenCalledWith({ data: [{ label: 'Potência', value: '5 HP', order: 0, productId: 'p1' }] })
  })

  it('only shows active products with at least one active category, never internal storage fields', async () => {
    await listActiveProductsPublic()
    const call = productMock.findMany.mock.calls[0]?.[0]
    expect(call?.where).toEqual({ active: true, categories: { some: { category: { active: true } } } })
    expect(call?.select).not.toHaveProperty('images.select.imageKey')
    expect(Object.keys(call?.select ?? {})).not.toContain('authorId')
  })
})
