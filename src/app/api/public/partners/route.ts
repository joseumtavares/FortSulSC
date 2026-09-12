import { NextResponse, type NextRequest } from 'next/server'
import { clientIp } from '@/lib/auth/request-ip'
import { checkPublicPartnersRateLimit, listPublicPartners } from '@/lib/content/partner-public-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { allowed, retryAfterMs } = await checkPublicPartnersRateLimit(clientIp(request))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  try {
    return NextResponse.json(await listPublicPartners())
  } catch {
    logger.error('public.partners_list_failed')
    return NextResponse.json({ error: 'Não foi possível carregar os representantes.' }, { status: 500 })
  }
}
