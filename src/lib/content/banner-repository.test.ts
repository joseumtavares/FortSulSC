import { beforeEach, describe, expect, it, vi } from 'vitest'

const bannerMock = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { banner: bannerMock },
}))

import { createBanner, findActiveBannersPublic, findBannerForAdmin, listBannersForAdmin, updateBanner } from './banner-repository'

describe('banner-repository', () => {
  beforeEach(() => {
    bannerMock.create.mockReset()
    bannerMock.findMany.mockReset()
    bannerMock.findUnique.mockReset()
    bannerMock.update.mockReset()

    bannerMock.create.mockResolvedValue(null)
    bannerMock.findMany.mockResolvedValue([])
    bannerMock.findUnique.mockResolvedValue(null)
    bannerMock.update.mockResolvedValue(null)
  })

  it('forces active false when creating banners', async () => {
    const input = {
      title: 'Banner institucional',
      linkUrl: 'https://fortsulsc.com.br',
      imageUrl: 'https://example.test/banner.jpg',
      imageKey: 'banners/banner.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      altText: 'Banner institucional',
      startAt: new Date('2026-10-01T00:00:00Z'),
      endAt: new Date('2026-10-31T23:59:59Z'),
      order: 3,
    }

    await createBanner(input)

    expect(bannerMock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...input,
        active: false,
      }),
    })
  })

  it('filters active banners inside the scheduling window', async () => {
    await findActiveBannersPublic()

    const call = bannerMock.findMany.mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ active: true })
    expect(call?.orderBy).toMatchObject({ order: 'asc' })
  })

  it('never selects internal storage details in the public query', async () => {
    await findActiveBannersPublic()

    const call = bannerMock.findMany.mock.calls[0]?.[0]
    expect(call?.select).toEqual({
      id: true,
      title: true,
      linkUrl: true,
      imageUrl: true,
      altText: true,
      startAt: true,
      endAt: true,
      order: true,
    })
  })

  it('fetches banner by id for admin', async () => {
    await findBannerForAdmin('banner-id')

    expect(bannerMock.findUnique).toHaveBeenCalledWith({ where: { id: 'banner-id' } })
  })

  it('updates banner by id', async () => {
    const input = {
      title: 'Banner atualizado',
      active: true,
    }

    await updateBanner('banner-id', input)

    expect(bannerMock.update).toHaveBeenCalledWith({
      where: { id: 'banner-id' },
      data: input,
    })
  })
})

it('lists all banners in administrative order', async () => {
  await listBannersForAdmin()
  expect(bannerMock.findMany).toHaveBeenCalledWith({ orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }] })
})
