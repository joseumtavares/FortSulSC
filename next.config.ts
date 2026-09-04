import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Site atual não tem formulário, script de terceiro ou iframe — CSP restrita a
// 'self' é segura sem quebrar nada. 'unsafe-inline' em script/style é o padrão
// do Next.js sem CSP baseada em nonce (infraestrutura de middleware não existe
// ainda); revisar para nonce quando o projeto ganhar Route Handlers/formulários
// (docs/Prompt_Mestre_Seguranca_Agentes.md §8).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

const nextConfig: NextConfig = {
  // CLAUDE.md é a fonte de governança deliberada do projeto (ver seção 3.1 do
  // CLAUDE.md e a Parte I do Plano Mestre); desativa a injeção automática do
  // bloco de regras do Next.js para agentes de IA a cada `next dev`.
  agentRules: false,
  // Permite que dispositivos na rede local recebam os scripts de desenvolvimento
  // do Next.js e consigam hidratar os componentes interativos.
  allowedDevOrigins: ['192.168.1.26'],
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...(isDev
            ? []
            : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]),
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
    ]
  },
}

export default nextConfig
