import { prisma } from '@/lib/db/client'

export type CreateBannerInput = {
  title: string
  linkUrl?: string | null
  imageUrl: string
  imageKey: string
  mimeType: string
  size: number
  altText: string
  startAt?: Date | null
  endAt?: Date | null
  order?: number
}

export type UpdateBannerInput = Partial<CreateBannerInput> & {
  active?: boolean
}

export function createBanner(input: CreateBannerInput) {
  return prisma.banner.create({
    data: {
      ...input,
      active: false,
    },
  })
}

export function findActiveBannersPublic() {
  const now = new Date()

  return prisma.banner.findMany({
    where: {
      active: true,
      AND: [
        {
          OR: [{ startAt: null }, { startAt: { lte: now } }],
        },
        {
          OR: [{ endAt: null }, { endAt: { gte: now } }],
        },
      ],
    },
    select: {
      id: true,
      title: true,
      linkUrl: true,
      imageUrl: true,
      imageKey: true,
      mimeType: true,
      size: true,
      altText: true,
      active: true,
      startAt: true,
      endAt: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { order: 'asc' },
  })
}

export function findBannerForAdmin(id: string) {
  return prisma.banner.findUnique({ where: { id } })
}

export function updateBanner(id: string, input: UpdateBannerInput) {
  return prisma.banner.update({
    where: { id },
    data: input,
  })
}

export function listBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }] })
}
