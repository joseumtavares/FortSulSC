import { parseSocialLinks, type SocialLinks } from './social-links'
import { MAX_PARTNER_DESCRIPTION_LENGTH, MAX_PARTNER_NAME_LENGTH } from './text-limits'

export const PARTNER_TYPES = ['REPRESENTATIVE', 'RESELLER'] as const
export type PartnerType = (typeof PARTNER_TYPES)[number]

export type PartnerTextInput = {
  type: PartnerType
  name: string
  description: string | null
  whatsapp: string
  socialLinks: SocialLinks | null | undefined
  websiteUrl: string | null
  approximateLat: number | null
  approximateLng: number | null
}

function parsePartnerType(value: unknown): PartnerType {
  const type = typeof value === 'string' ? value.toUpperCase() : ''
  if (!PARTNER_TYPES.includes(type as PartnerType)) throw new Error('Tipo de parceiro inválido.')
  return type as PartnerType
}

function optionalText(value: unknown, max: number, fieldLabel: string): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Campo de texto inválido.')
  const text = value.trim() || null
  if (text && text.length > max) throw new Error(`${fieldLabel} deve ter no máximo ${max} caracteres.`)
  return text
}

function optionalLink(value: unknown): string | null {
  if (value != null && typeof value !== 'string') throw new Error('Link inválido.')
  const link = typeof value === 'string' ? value.trim() || null : null
  if (link) {
    let url: URL
    try {
      url = new URL(link)
    } catch {
      throw new Error('Informe um link HTTP ou HTTPS válido.')
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Link inválido.')
  }
  return link
}

/**
 * Arredonda para ~1km de precisão (2 casas decimais) — CLAUDE.md §14 exige
 * coordenadas aproximadas para representante pessoa física. O arredondamento
 * roda sempre no servidor, independente do que foi digitado, para não
 * depender de disciplina manual de quem preenche o formulário.
 */
function parseApproximateCoordinate(value: unknown, min: number, max: number, fieldLabel: string): number | null {
  if (value == null || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) throw new Error(`${fieldLabel} inválida.`)
  if (num < min || num > max) throw new Error(`${fieldLabel} fora do intervalo válido.`)
  return Math.round(num * 100) / 100
}

export function parsePartnerInput(value: unknown): PartnerTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : ''
  if (!name) throw new Error('Nome obrigatório.')
  if (!whatsapp) throw new Error('WhatsApp obrigatório.')
  if (name.length > MAX_PARTNER_NAME_LENGTH) throw new Error(`Nome deve ter no máximo ${MAX_PARTNER_NAME_LENGTH} caracteres.`)

  return {
    type: parsePartnerType(body.type),
    name,
    whatsapp,
    description: optionalText(body.description, MAX_PARTNER_DESCRIPTION_LENGTH, 'Descrição'),
    socialLinks: parseSocialLinks(body.socialLinks),
    websiteUrl: optionalLink(body.websiteUrl),
    approximateLat: parseApproximateCoordinate(body.approximateLat, -90, 90, 'Latitude'),
    approximateLng: parseApproximateCoordinate(body.approximateLng, -180, 180, 'Longitude'),
  }
}
