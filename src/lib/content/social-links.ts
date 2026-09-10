export type SocialLinks = { facebook?: string; instagram?: string; linkedin?: string; youtube?: string }
const networks = new Set(['facebook', 'instagram', 'linkedin', 'youtube'])

function parseLink(link: unknown): string {
  if (typeof link !== 'string') throw new Error('Informe uma URL HTTPS para cada rede social.')
  let url: URL
  try { url = new URL(link) } catch { throw new Error('URL de rede social inválida.') }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    throw new Error('Informe uma URL HTTPS para cada rede social.')
  }
  return link
}

export function parseSocialLinks(value: unknown): SocialLinks | null | undefined {
  if (value === undefined || value === null) return value
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Redes sociais inválidas.')
  const result: SocialLinks = {}
  for (const [key, link] of Object.entries(value)) {
    if (!networks.has(key)) throw new Error('Rede social não suportada.')
    if (link == null) continue
    result[key as keyof SocialLinks] = parseLink(link)
  }
  return result
}
