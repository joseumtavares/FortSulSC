import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import type { PartnerTextInput, PartnerType } from './partner-input'
import type { PartnerPrivateInput } from './partner-private-input'

/**
 * `locationLink` não é coluna do banco — é só o link colado pelo admin, que
 * a rota já resolveu para `approximateLat`/`approximateLng` antes de chegar
 * aqui (`resolveLocationLink`, em `location-link.ts`), então é descartado.
 * `null` explícito precisa do sentinela do Prisma para um campo Json
 * anulável — mesmo padrão de `upsertInstitutionalSettings`.
 */
function toPartnerData(input: PartnerTextInput) {
  const { locationLink: _locationLink, ...rest } = input
  return { ...rest, socialLinks: input.socialLinks === null ? Prisma.DbNull : input.socialLinks }
}

export function listPartnersForAdmin(type?: PartnerType) {
  return prisma.partner.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
  })
}

export function findPartnerForAdmin(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: {
      private: true,
      commercialAreas: { select: { commercialAreaId: true } },
    },
  })
}

export function createPartner(input: PartnerTextInput) {
  return prisma.partner.create({ data: toPartnerData(input) })
}

export function updatePartner(id: string, input: PartnerTextInput) {
  return prisma.partner.update({ where: { id }, data: toPartnerData(input) })
}

export function updatePartnerActive(id: string, active: boolean) {
  return prisma.partner.update({ where: { id }, data: { active } })
}

export function updatePartnerLogo(id: string, logoUrl: string, logoKey: string) {
  return prisma.partner.update({ where: { id }, data: { logoUrl, logoKey } })
}

export function deletePartner(id: string) {
  return prisma.partner.delete({ where: { id } })
}

/** Substitui todos os vínculos de área comercial do parceiro de uma vez. */
export function setPartnerCommercialAreas(id: string, commercialAreaIds: string[]) {
  return prisma.$transaction([
    prisma.partnerCommercialArea.deleteMany({ where: { partnerId: id } }),
    prisma.partnerCommercialArea.createMany({
      data: commercialAreaIds.map((commercialAreaId) => ({ partnerId: id, commercialAreaId })),
    }),
  ])
}

/**
 * `consentGivenAt` só é definido na criação (primeira vez que o parceiro
 * declara consentimento) — corrigir documento/observações depois não deve
 * resetar a data original do consentimento.
 */
export function upsertPartnerPrivate(partnerId: string, input: PartnerPrivateInput) {
  return prisma.partnerPrivate.upsert({
    where: { partnerId },
    update: { document: input.document, consentNotes: input.consentNotes },
    create: { partnerId, document: input.document, consentNotes: input.consentNotes, consentGivenAt: new Date() },
  })
}
