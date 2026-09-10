export type BannerTextInput = {
  title: string
  altText: string
  linkUrl: string | null
  startAt: Date | null
  endAt: Date | null
}

function optionalDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error('Data inválida. Informe data e horário com fuso.')
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida.')
  return date
}

export function parseBannerInput(value: unknown): BannerTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const altText = typeof body.altText === 'string' ? body.altText.trim() : ''
  if (!title) throw new Error('Título obrigatório.')
  if (!altText) throw new Error('Texto alternativo obrigatório.')
  const linkUrl = optionalLink(body.linkUrl)
  const startAt = optionalDate(body.startAt)
  const endAt = optionalDate(body.endAt)
  if (startAt && endAt && startAt > endAt) throw new Error('O fim deve ser igual ou posterior ao início.')
  return { title, altText, linkUrl, startAt, endAt }
}

function optionalLink(value: unknown): string | null {
  if (value != null && typeof value !== 'string') throw new Error('Link inválido.')
  const linkUrl = typeof value === 'string' ? value.trim() || null : null
  if (linkUrl) {
    let url: URL
    try { url = new URL(linkUrl) } catch { throw new Error('Informe um link HTTP ou HTTPS válido.') }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Link inválido.')
  }
  return linkUrl
}
