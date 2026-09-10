import { parseSocialLinks } from './social-links'

function optionalText(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Os campos de contato devem ser texto.')
  return value.trim() || null
}

export function parseInstitutionalSettings(value: Record<string, unknown> | null) {
  if (!value) throw new Error('Dados inválidos.')
  const whatsapp = optionalText(value.whatsapp)
  const email = optionalText(value.email)
  if (!whatsapp) throw new Error('WhatsApp obrigatório.')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.')
  return {
    whatsapp, email,
    phone: optionalText(value.phone),
    cnpj: optionalText(value.cnpj),
    address: optionalText(value.address),
    socialLinks: parseSocialLinks(value.socialLinks),
  }
}
