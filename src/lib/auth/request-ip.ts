import type { NextRequest } from 'next/server'

function trustsProxyHeaders(): boolean {
  return process.env.TRUST_PROXY_HEADERS === 'true'
}

/**
 * Retorna o IP só quando ele veio de um proxy que a implantação declarou
 * confiável. Sem essa declaração, os cabeçalhos HTTP são controlados pelo
 * cliente e não podem participar da decisão de segurança.
 */
export function clientIp(request: NextRequest): string {
  if (!trustsProxyHeaders()) {
    return '0.0.0.0'
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? '0.0.0.0'
  }
  return request.headers.get('x-real-ip') ?? '0.0.0.0'
}
