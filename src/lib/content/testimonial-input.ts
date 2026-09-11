export const TESTIMONIAL_PLATFORMS = ['TIKTOK', 'FACEBOOK', 'INSTAGRAM'] as const
export type TestimonialPlatform = (typeof TESTIMONIAL_PLATFORMS)[number]

export const MAX_PRODUCT_TESTIMONIALS = 3

const PLATFORM_DOMAINS: Record<TestimonialPlatform, string[]> = {
  TIKTOK: ['tiktok.com', 'vm.tiktok.com'],
  FACEBOOK: ['facebook.com', 'fb.watch'],
  INSTAGRAM: ['instagram.com'],
}

export type TestimonialTextInput = { platform: TestimonialPlatform; url: string; authorName: string | null }

function isAllowedHost(hostname: string, platform: TestimonialPlatform): boolean {
  const host = hostname.replace(/^www\./, '')
  return PLATFORM_DOMAINS[platform].some((domain) => host === domain || host.endsWith(`.${domain}`))
}

function parsePlatform(value: unknown): TestimonialPlatform {
  const platform = typeof value === 'string' ? value.toUpperCase() : ''
  if (!TESTIMONIAL_PLATFORMS.includes(platform as TestimonialPlatform)) throw new Error('Rede social não suportada.')
  return platform as TestimonialPlatform
}

function parseTestimonialUrl(value: unknown, platform: TestimonialPlatform): string {
  const rawUrl = typeof value === 'string' ? value.trim() : ''
  if (!rawUrl) throw new Error('Link obrigatório.')

  const url = parseUrl(rawUrl)
  const isSecureLink = url.protocol === 'https:' && !url.username && !url.password
  if (!isSecureLink) throw new Error('Informe um link HTTPS válido.')
  if (!isAllowedHost(url.hostname, platform)) throw new Error('O link precisa ser do domínio da rede social selecionada.')

  return rawUrl
}

function parseUrl(rawUrl: string): URL {
  try {
    return new URL(rawUrl)
  } catch {
    throw new Error('Link inválido.')
  }
}

export function parseTestimonialInput(value: unknown): TestimonialTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>

  const platform = parsePlatform(body.platform)
  const url = parseTestimonialUrl(body.url, platform)
  const authorName = typeof body.authorName === 'string' ? body.authorName.trim() || null : null

  return { platform, url, authorName }
}
