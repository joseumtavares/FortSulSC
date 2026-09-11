import {
  MAX_PRODUCT_CODE_LENGTH,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_EYEBROW_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_WHATSAPP_MESSAGE_LENGTH,
} from './text-limits'

export type ProductTextInput = {
  code: string
  name: string
  eyebrow: string | null
  shortDescription: string | null
  description: string | null
  catalogUrl: string | null
  whatsappMessageTemplate: string | null
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

export function parseProductInput(value: unknown): ProductTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!code) throw new Error('Código obrigatório.')
  if (!name) throw new Error('Nome obrigatório.')
  if (code.length > MAX_PRODUCT_CODE_LENGTH) throw new Error(`Código deve ter no máximo ${MAX_PRODUCT_CODE_LENGTH} caracteres.`)
  if (name.length > MAX_PRODUCT_NAME_LENGTH) throw new Error(`Nome deve ter no máximo ${MAX_PRODUCT_NAME_LENGTH} caracteres.`)

  return {
    code,
    name,
    eyebrow: optionalText(body.eyebrow, MAX_PRODUCT_EYEBROW_LENGTH, 'Selo/eyebrow'),
    shortDescription: optionalText(body.shortDescription, MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH, 'Descrição curta'),
    description: optionalText(body.description, MAX_PRODUCT_DESCRIPTION_LENGTH, 'Descrição'),
    catalogUrl: optionalLink(body.catalogUrl),
    whatsappMessageTemplate: optionalText(body.whatsappMessageTemplate, MAX_PRODUCT_WHATSAPP_MESSAGE_LENGTH, 'Mensagem do WhatsApp'),
  }
}
