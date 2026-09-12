import { prisma } from '@/lib/db/client'
import { slugify } from './slug'
import type { CommercialAreaTextInput } from './commercial-area-input'

/**
 * Deriva um slug único a partir do nome, mesmo padrão de
 * `generateUniqueProductSlug`/`generateUniqueArticleSlug`.
 */
export async function generateUniqueCommercialAreaSlug(name: string): Promise<string> {
  const base = slugify(name) || 'area'
  let candidate = base
  let suffix = 2

  while (await prisma.commercialArea.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export function listCommercialAreasForAdmin() {
  return prisma.commercialArea.findMany({
    orderBy: { name: 'asc' },
    include: { municipalities: { select: { municipalityId: true } } },
  })
}

export function findCommercialAreaForAdmin(id: string) {
  return prisma.commercialArea.findUnique({
    where: { id },
    include: { municipalities: { select: { municipalityId: true } } },
  })
}

export async function createCommercialArea(input: CommercialAreaTextInput) {
  const slug = await generateUniqueCommercialAreaSlug(input.name)
  return prisma.commercialArea.create({ data: { ...input, slug } })
}

export function updateCommercialArea(id: string, input: CommercialAreaTextInput) {
  return prisma.commercialArea.update({ where: { id }, data: input })
}

export function deleteCommercialArea(id: string) {
  return prisma.commercialArea.delete({ where: { id } })
}

/** Substitui todos os vínculos de município da área comercial de uma vez. */
export function setCommercialAreaMunicipalities(id: string, municipalityIds: string[]) {
  return prisma.$transaction([
    prisma.commercialAreaMunicipality.deleteMany({ where: { commercialAreaId: id } }),
    prisma.commercialAreaMunicipality.createMany({
      data: municipalityIds.map((municipalityId) => ({ commercialAreaId: id, municipalityId })),
    }),
  ])
}
