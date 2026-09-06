/** Cabeçalho no formato consumido por `next.config.ts`. */
export interface SecurityHeader {
  key: string
  value: string
}

/**
 * Política única para todas as respostas HTTP do aplicativo.
 * `includeHsts` só deve ser verdadeiro em ambiente já servido por HTTPS.
 */
export function securityHeaders(
  includeHsts: boolean,
  isDevelopment = process.env.NODE_ENV === 'development',
): SecurityHeader[] {
  const scriptSource = isDevelopment
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'"
  const headers: SecurityHeader[] = [
    {
      key: 'Content-Security-Policy',
      // O Next.js precisa de scripts e estilos inline para a renderização atual.
      // Não permitimos domínios externos nem plugins/objetos executáveis.
      value: `default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'`,
    },
    { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
  ]

  if (includeHsts) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    })
  }

  return headers
}
