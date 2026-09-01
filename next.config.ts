import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // CLAUDE.md é a fonte de governança deliberada do projeto (ver seção 3.1 do
  // CLAUDE.md e a Parte I do Plano Mestre); desativa a injeção automática do
  // bloco de regras do Next.js para agentes de IA a cada `next dev`.
  agentRules: false,
  // Permite que dispositivos na rede local recebam os scripts de desenvolvimento
  // do Next.js e consigam hidratar os componentes interativos.
  allowedDevOrigins: ['192.168.1.26'],
  output: 'standalone',
}

export default nextConfig
