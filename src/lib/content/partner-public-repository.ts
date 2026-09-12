import { prisma } from '@/lib/db/client'
import { checkAndIncrementRateLimit, type RateLimitRule } from '@/lib/auth/rate-limit'
import type { SocialLinks } from './social-links'

export type PublicPartner = {
  id: string
  type: 'REPRESENTATIVE' | 'RESELLER'
  name: string
  description: string | null
  whatsapp: string
  websiteUrl: string | null
  logoUrl: string | null
  approximateLat: number | null
  approximateLng: number | null
  socialLinks: SocialLinks | null
  municipalities: string[]
}

/**
 * Seleção explícita de campos (CLAUDE.md §14): nunca inclui `PartnerPrivate`
 * (documento/consentimento LGPD nunca são consultados aqui, nem por engano
 * via `include`) nem `logoKey`/timestamps internos. Lista de campos públicos
 * aprovada por Jose em 12/09/2026 (Plano Mestre).
 */
export async function listPublicPartners(): Promise<PublicPartner[]> {
  const partners = await prisma.partner.findMany({
    where: { active: true },
    select: {
      id: true,
      type: true,
      name: true,
      description: true,
      whatsapp: true,
      websiteUrl: true,
      logoUrl: true,
      approximateLat: true,
      approximateLng: true,
      socialLinks: true,
      commercialAreas: {
        select: {
          commercialArea: {
            select: { municipalities: { select: { municipality: { select: { name: true } } } } },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return partners.map(({ commercialAreas, socialLinks, ...partner }) => ({
    ...partner,
    socialLinks: (socialLinks as SocialLinks | null) ?? null,
    municipalities: dedupeSorted(
      commercialAreas.flatMap((link) => link.commercialArea.municipalities.map((entry) => entry.municipality.name)),
    ),
  }))
}

function dedupeSorted(names: string[]): string[] {
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/**
 * Primeira rota pública dinâmica do projeto — rate limiting básico por IP
 * pedido por Jose antes do lançamento (Plano Mestre, 12/09/2026). Chave não é
 * hasheada (diferente do fluxo de login): não é dado de autenticação, e o
 * dataset exposto já é público por definição.
 */
const PUBLIC_PARTNERS_RATE_LIMIT_RULE: RateLimitRule = { windowMs: 60_000, limit: 30, blockAtLimit: true }

export function checkPublicPartnersRateLimit(ip: string) {
  return checkAndIncrementRateLimit(prisma, { dimension: 'IP', key: ip, context: 'PARTNERS_READ', rule: PUBLIC_PARTNERS_RATE_LIMIT_RULE })
}
