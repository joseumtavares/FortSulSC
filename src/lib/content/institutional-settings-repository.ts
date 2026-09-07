import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/client'

export type InstitutionalSettingsInput = {
  whatsapp: string
  phone?: string | null
  email: string
  cnpj?: string | null
  address?: string | null
  socialLinks?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
}

export function getInstitutionalSettings() {
  return prisma.institutionalSettings.findUnique({ where: { singletonKey: 1 } })
}

export function upsertInstitutionalSettings(input: InstitutionalSettingsInput) {
  return prisma.institutionalSettings.upsert({
    where: { singletonKey: 1 },
    update: input,
    create: {
      singletonKey: 1,
      ...input,
    },
  })
}
