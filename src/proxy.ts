import { NextResponse, type NextRequest } from 'next/server'
import { buildContentSecurityPolicy } from '@/lib/security/headers'

/**
 * A CSP com nonce só pode ser montada aqui: o nonce precisa ser novo a cada
 * requisição (ver `buildContentSecurityPolicy`), o que `next.config.ts`
 * (headers() estático, calculado uma vez no build) não permite. O nonce
 * também é propagado como `x-nonce` para a própria aplicação poder lê-lo via
 * `headers()` do `next/headers`, caso algum dia precise aplicá-lo
 * manualmente a um script — hoje nenhum componente insere `<script>` manual,
 * então isso é só para o Next.js aplicar aos seus próprios scripts injetados.
 *
 * Usa a convenção `proxy.ts` do Next.js 16 (antigo `middleware.ts`,
 * descontinuado) — não é usado para decisão de autenticação/autorização,
 * só para injetar este cabeçalho; a checagem de sessão/origem continua em
 * `requireAdminRequest` (`src/lib/auth/admin-route-guard.ts`), a cada rota.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildContentSecurityPolicy(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    /*
     * Roda em toda rota, exceto assets internos do Next.js e arquivos
     * estáticos com extensão (imagens, fontes etc.) — mesmo padrão do
     * exemplo oficial do Next.js para CSP com nonce.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
