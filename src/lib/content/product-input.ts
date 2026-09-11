export type ProductTextInput = {
  code: string
  name: string
  eyebrow: string | null
  shortDescription: string | null
  description: string | null
  catalogUrl: string | null
  whatsappMessageTemplate: string | null
}

function optionalText(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Campo de texto inválido.')
  return value.trim() || null
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

  return {
    code,
    name,
    eyebrow: optionalText(body.eyebrow),
    shortDescription: optionalText(body.shortDescription),
    description: optionalText(body.description),
    catalogUrl: optionalLink(body.catalogUrl),
    whatsappMessageTemplate: optionalText(body.whatsappMessageTemplate),
  }
}
