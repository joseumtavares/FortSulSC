import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { parseSocialLinks } from './social-links'

export type InstitutionalSettingsInput = {
  whatsapp: string
  phone?: string | null
  email: string
  cnpj?: string | null
  address?: string | null
  socialLinks?: unknown
}

export function getInstitutionalSettings() {
  return prisma.institutionalSettings.findUnique({ where: { singletonKey: 1 } })
}

export function upsertInstitutionalSettings(input: InstitutionalSettingsInput) {
  const socialLinks = parseSocialLinks(input.socialLinks)
  const data = {
    whatsapp: input.whatsapp,
    phone: input.phone,
    email: input.email,
    cnpj: input.cnpj,
    address: input.address,
    socialLinks: socialLinks === null ? Prisma.DbNull : socialLinks,
  }
  return prisma.institutionalSettings.upsert({
    where: { singletonKey: 1 },
    update: data,
    create: {
      singletonKey: 1,
      ...data,
    },
  })
}
