import type { NextConfig } from 'next'
import { securityHeaders } from './src/lib/security/headers'

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
    return [{
      source: '/:path*',
      // HSTS só é ativado quando o ambiente HTTPS de produção o declara.
      // Content-Security-Policy não está aqui: precisa de um nonce novo a
      // cada requisição, e headers() é estático (calculado uma vez no
      // build) — ver `src/middleware.ts`.
      headers: securityHeaders(process.env.SECURITY_HEADERS_HSTS === 'true'),
    }]
  },
}

export default nextConfig
