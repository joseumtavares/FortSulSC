import { prisma } from '@/lib/db/client'
import { checkAndIncrementRateLimit, type RateLimitRule } from '@/lib/auth/rate-limit'
import { logger } from '@/lib/logger'
import type { SocialLinks } from './social-links'

/**
 * Rede de segurança, não paginação: nunca deveria ser atingido no uso real
 * (rede de representantes regionais), só impede a resposta de crescer sem
 * teto se o volume de dados um dia sair do esperado. Decisão de Jose em
 * 14/09/2026 (`docs/Proposta_Fase5_Limite_Partners_Publicos.md`) — se o teto
 * for atingido de verdade, é sinal para desenhar paginação/busca
 * server-side de verdade, não para aumentar o número.
 */
const MAX_PUBLIC_PARTNERS = 500

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

let cache: { data: PublicPartner[]; expiresAt: number } | null = null

/**
 * TTL de 2 minutos, sem invalidação nas rotas administrativas — decisão
 * explícita de Jose em 14/09/2026 (`docs/Proposta_Fase5_Cache_Partners_Publicos.md`):
 * consistência eventual de até 2 minutos é aceitável para o mapa público, e
 * manter o escopo pequeno (nenhuma rota de admin precisa saber deste cache)
 * pesa mais do que refletir uma edição instantaneamente.
 */
const CACHE_TTL_MS = 120_000

/** Só para teste: força a próxima chamada a ignorar o cache em memória. */
export function resetPublicPartnersCacheForTests(): void {
  cache = null
}

export async function listPublicPartners(): Promise<PublicPartner[]> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) return cache.data

  const data = await fetchPublicPartners()
  cache = { data, expiresAt: now + CACHE_TTL_MS }
  return data
}

/**
 * Seleção explícita de campos (CLAUDE.md §14): nunca inclui `PartnerPrivate`
 * (documento/consentimento LGPD nunca são consultados aqui, nem por engano
 * via `include`) nem `logoKey`/timestamps internos. Lista de campos públicos
 * aprovada por Jose em 12/09/2026 (Plano Mestre).
 */
async function fetchPublicPartners(): Promise<PublicPartner[]> {
  const partners = await prisma.partner.findMany({
    where: { active: true },
    take: MAX_PUBLIC_PARTNERS,
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

  if (partners.length === MAX_PUBLIC_PARTNERS) {
    logger.error('public.partners_list_truncated', { limit: MAX_PUBLIC_PARTNERS })
  }

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
