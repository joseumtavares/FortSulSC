import { beforeEach, describe, expect, it, vi } from 'vitest'

const productTestimonialMock = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() }))
vi.mock('@/lib/db/client', () => ({ prisma: { productTestimonial: productTestimonialMock } }))

import {
  countProductTestimonials,
  createProductTestimonial,
  deleteProductTestimonial,
  findProductTestimonial,
  listProductTestimonials,
} from './product-testimonial-repository'

describe('product-testimonial-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    productTestimonialMock.count.mockResolvedValue(1)
  })

  it('lists testimonials ordered', async () => {
    await listProductTestimonials('p1')
    expect(productTestimonialMock.findMany).toHaveBeenCalledWith({ where: { productId: 'p1' }, orderBy: { order: 'asc' } })
  })

  it('counts testimonials for a product', async () => {
    await countProductTestimonials('p1')
    expect(productTestimonialMock.count).toHaveBeenCalledWith({ where: { productId: 'p1' } })
  })

  it('finds testimonial by id', async () => {
    await findProductTestimonial('t1')
    expect(productTestimonialMock.findUnique).toHaveBeenCalledWith({ where: { id: 't1' } })
  })

  it('creates testimonial with the next order position', async () => {
    const input = { productId: 'p1', platform: 'TIKTOK' as const, url: 'https://tiktok.com/@x/video/1', authorName: 'Parceiro' }
    await createProductTestimonial(input)
    expect(productTestimonialMock.create).toHaveBeenCalledWith({ data: { ...input, order: 1 } })
  })

  it('deletes testimonial by id', async () => {
    await deleteProductTestimonial('t1')
    expect(productTestimonialMock.delete).toHaveBeenCalledWith({ where: { id: 't1' } })
  })
})
