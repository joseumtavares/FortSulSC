import { beforeEach, describe, expect, it, vi } from 'vitest'

const productImageMock = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() }))
vi.mock('@/lib/db/client', () => ({ prisma: { productImage: productImageMock } }))

import { countProductImages, createProductImage, deleteProductImage, findProductImage, listProductImages } from './product-image-repository'

describe('product-image-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    productImageMock.count.mockResolvedValue(2)
  })

  it('lists images ordered', async () => {
    await listProductImages('p1')
    expect(productImageMock.findMany).toHaveBeenCalledWith({ where: { productId: 'p1' }, orderBy: { order: 'asc' } })
  })

  it('counts images for a product', async () => {
    await countProductImages('p1')
    expect(productImageMock.count).toHaveBeenCalledWith({ where: { productId: 'p1' } })
  })

  it('finds image by id', async () => {
    await findProductImage('img-1')
    expect(productImageMock.findUnique).toHaveBeenCalledWith({ where: { id: 'img-1' } })
  })

  it('creates image with the next order position', async () => {
    const input = { productId: 'p1', imageUrl: 'https://r2.example/x.webp', imageKey: 'k', mimeType: 'image/webp', size: 10, altText: 'Alt', role: 'GALLERY' as const }
    await createProductImage(input)
    expect(productImageMock.create).toHaveBeenCalledWith({ data: { ...input, order: 2 } })
  })

  it('deletes image by id', async () => {
    await deleteProductImage('img-1')
    expect(productImageMock.delete).toHaveBeenCalledWith({ where: { id: 'img-1' } })
  })
})
