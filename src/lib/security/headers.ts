/** Cabeçalho no formato consumido por `next.config.ts`. */
export interface SecurityHeader {
  key: string
  value: string
}

/**
 * Extrai só a origem (protocolo + host) de uma URL configurada, para uso em
 * diretivas de CSP. Retorna null se a variável não estiver definida ou não
 * for uma URL válida, para nunca quebrar o build por causa de uma env var
 * ausente em um provedor de storage que não está em uso.
 */
function originOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/**
 * Política única para todas as respostas HTTP do aplicativo.
 * `includeHsts` só deve ser verdadeiro em ambiente já servido por HTTPS.
 *
 * `imageStorageOrigins` inclui a origem do provedor de storage de imagens
 * configurado (Supabase Storage, R2, etc.) em `img-src`, para que a capa e a
 * galeria de artigos, servidas de um domínio externo, carreguem no navegador.
 * Passar as origens explicitamente (em vez de ler `process.env` aqui) mantém
 * esta função pura e testável.
 */
export function securityHeaders(
  includeHsts: boolean,
  isDevelopment = process.env.NODE_ENV === 'development',
  imageStorageOrigins: (string | null | undefined)[] = [
    originOf(process.env.SUPABASE_STORAGE_URL),
    originOf(process.env.R2_PUBLIC_BASE_URL),
  ],
): SecurityHeader[] {
  const scriptSource = isDevelopment
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'"
  // Ladrilhos do mapa de representantes (Fase 5, `LeafletMap`) vêm dos
  // subdomínios a/b/c do OpenStreetMap — precisam estar sempre liberados,
  // independente do storage de imagens configurado no ambiente.
  const imgSource = [
    "'self'",
    'data:',
    'blob:',
    'https://*.tile.openstreetmap.org',
    ...imageStorageOrigins.filter((origin): origin is string => Boolean(origin)),
  ].join(' ')
  const headers: SecurityHeader[] = [
    {
      key: 'Content-Security-Policy',
      // O Next.js precisa de scripts e estilos inline para a renderização atual.
      // Não permitimos domínios externos nem plugins/objetos executáveis,
      // exceto o storage de imagens configurado e os ladrilhos do mapa (ver
      // imgSource acima).
      value: `default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src ${imgSource}; object-src 'none'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'`,
    },
    // `geolocation=(self)`: o mapa de representantes (Fase 5) pede a
    // localização do visitante para centralizar o mapa — precisa estar
    // liberada para a própria origem, senão o navegador bloqueia a API antes
    // mesmo do usuário ver o prompt de permissão.
    { key: 'Permissions-Policy', value: 'camera=(), geolocation=(self), microphone=()' },
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
