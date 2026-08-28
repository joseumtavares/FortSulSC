import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // CLAUDE.md é a fonte de governança deliberada do projeto (ver seção 3.1 do
  // CLAUDE.md e a Parte I do Plano Mestre); desativa a injeção automática do
  // bloco de regras do Next.js para agentes de IA a cada `next dev`.
  agentRules: false,
}

export default nextConfig
