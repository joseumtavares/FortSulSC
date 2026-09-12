import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  product: { count: vi.fn() },
  category: { count: vi.fn() },
  partner: { count: vi.fn() },
  banner: { count: vi.fn() },
  article: { count: vi.fn() },
}))
vi.mock('@/lib/db/client', () => ({ prisma: mocks }))

import { getDashboardCounts } from './dashboard-repository'

describe('getDashboardCounts', () => {
  it('counts each entity, splitting partners by type', async () => {
    mocks.product.count.mockResolvedValue(12)
    mocks.category.count.mockResolvedValue(4)
    mocks.partner.count.mockImplementation(({ where }: { where: { type: string } }) =>
      Promise.resolve(where.type === 'REPRESENTATIVE' ? 7 : 3),
    )
    mocks.banner.count.mockResolvedValue(2)
    mocks.article.count.mockResolvedValue(9)

    const counts = await getDashboardCounts()

    expect(counts).toEqual({ products: 12, categories: 4, representatives: 7, resellers: 3, banners: 2, articles: 9 })
    expect(mocks.partner.count).toHaveBeenCalledWith({ where: { type: 'REPRESENTATIVE' } })
    expect(mocks.partner.count).toHaveBeenCalledWith({ where: { type: 'RESELLER' } })
  })
})
