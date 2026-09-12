/**
 * Extrai coordenadas de um link de localização compartilhado do celular
 * (Google Maps/Apple Maps) — o representante compartilha o link, o admin
 * cola no formulário, o servidor extrai lat/lng automaticamente em vez de
 * exigir digitação manual das coordenadas.
 *
 * Links curtos (ex.: `maps.app.goo.gl/xxxxx`) não têm coordenada na própria
 * URL — precisam de uma requisição HTTP para seguir o redirecionamento até
 * a URL final, que aí sim tem `@lat,lng` ou `q=lat,lng`. Por segurança, só
 * seguimos redirecionamento para hosts de mapa conhecidos (nunca uma URL
 * arbitrária do usuário).
 */

const ALLOWED_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'www.google.com',
  'maps.google.com',
  'maps.apple.com',
])

export function parseLocationLinkInput(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Link de localização inválido.')
  const link = value.trim()
  if (!link) return null

  let url: URL
  try {
    url = new URL(link)
  } catch {
    throw new Error('Informe um link de localização válido (Google Maps ou Apple Maps).')
  }
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error('Link de localização precisa ser do Google Maps ou Apple Maps.')
  }
  return link
}

function extractCoordinatesFromUrl(url: URL): { lat: number; lng: number } | null {
  // Google Maps: .../@-27.123456,-48.654321,17z...
  const atMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }

  // Google Maps: ?q=-27.123456,-48.654321
  const q = url.searchParams.get('q')
  const qMatch = q?.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/)
  if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) }

  // Apple Maps: ?ll=-27.123456,-48.654321
  const ll = url.searchParams.get('ll')
  const llMatch = ll?.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/)
  if (llMatch) return { lat: Number(llMatch[1]), lng: Number(llMatch[2]) }

  return null
}

/**
 * Segue o link (resolvendo redirecionamento de link curto se preciso) e
 * extrai as coordenadas. Lança erro se não conseguir — quem chama decide
 * a mensagem exibida.
 */
export async function resolveLocationLink(link: string): Promise<{ lat: number; lng: number }> {
  const initialUrl = new URL(link)
  const direct = extractCoordinatesFromUrl(initialUrl)
  if (direct) return direct

  const response = await fetch(link, { method: 'GET', redirect: 'follow' })
  const finalUrl = new URL(response.url)
  if (!ALLOWED_HOSTS.has(finalUrl.hostname)) {
    throw new Error('O link não redirecionou para um host de mapa conhecido.')
  }

  const resolved = extractCoordinatesFromUrl(finalUrl)
  if (!resolved) throw new Error('Não foi possível encontrar as coordenadas nesse link.')
  return resolved
}

/** Gera um link de mapa a partir de coordenadas já salvas — usado para exibir "ver no mapa" sem guardar o link original do representante. */
export function buildLocationMapLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`
}
