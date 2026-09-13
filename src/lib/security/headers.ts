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
 * CSP com nonce por requisição — só pode ser montada no middleware (onde o
 * nonce é gerado a cada requisição), nunca em `next.config.ts` (headers()
 * ali são estáticos, calculados uma vez no build). Substituiu uma versão
 * anterior com `'unsafe-inline'` em `script-src` (achado de segurança do
 * Jose, 12/09/2026: XSS/CSP) — com nonce, um `<script>` injetado por um
 * ataque de XSS não tem como adivinhar o nonce da requisição e é bloqueado
 * pelo navegador, mesmo que a injeção em si não seja evitada por outra
 * camada.
 *
 * `'strict-dynamic'` é o que permite os chunks JS que o Next.js injeta
 * dinamicamente em tempo de execução (code splitting) funcionarem: browsers
 * que suportam essa diretiva confiam em qualquer script carregado por um
 * script já autorizado pelo nonce, sem precisar de um nonce individual por
 * chunk; navegadores mais antigos, que ignoram `strict-dynamic`, caem de
 * volta no allowlist de `'self'` também presente na diretiva.
 *
 * `style-src` mantém `'unsafe-inline'`, de propósito: nonce/hash em CSP só
 * vale para elementos `<style>`, nunca para o atributo HTML `style="..."`
 * — e o app usa esse atributo o tempo todo (o próprio React, `LeafletMap`,
 * etc.), então trocar por nonce quebraria a estilização legítima em todo o
 * site (confirmado em teste manual: só a home já gerava ~36 violações de
 * CSP). Isso é uma limitação conhecida do CSP, não um descuido — o risco
 * real de XSS está em `script-src` (execução de JS arbitrário), que o nonce
 * já cobre; injeção via CSS não executa JS em navegadores modernos.
 *
 * `imageStorageOrigins` inclui a origem do provedor de storage de imagens
 * configurado (Supabase Storage, R2, etc.) em `img-src`, para que a capa e a
 * galeria de artigos, servidas de um domínio externo, carreguem no navegador.
 * Passar as origens explicitamente (em vez de ler `process.env` aqui) mantém
 * esta função pura e testável.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment = process.env.NODE_ENV === 'development',
  imageStorageOrigins: (string | null | undefined)[] = [
    originOf(process.env.SUPABASE_STORAGE_URL),
    originOf(process.env.R2_PUBLIC_BASE_URL),
  ],
): string {
  // O Turbopack/webpack de desenvolvimento precisa de `unsafe-eval` para
  // Fast Refresh — não há alternativa com nonce para isso, então continua
  // restrito ao servidor de desenvolvimento, nunca em produção.
  const scriptSource = isDevelopment
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`
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
  return `default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src ${imgSource}; object-src 'none'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'`
}

/**
 * Cabeçalhos estáticos, iguais em toda requisição — aplicados via
 * `next.config.ts` (`headers()`, calculado uma vez no build). A
 * Content-Security-Policy fica fora daqui de propósito: precisa de um nonce
 * novo a cada requisição, então é montada no middleware
 * (`buildContentSecurityPolicy`, acima) e aplicada em `src/middleware.ts`.
 * `includeHsts` só deve ser verdadeiro em ambiente já servido por HTTPS.
 */
export function securityHeaders(includeHsts: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
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
