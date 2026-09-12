import { prisma } from '@/lib/db/client'

/**
 * Geografia oficial do IBGE — dado de referência semeado por
 * `prisma/seed.ts`, sem CRUD administrativo (ver
 * `docs/Proposta_Fase4_Fatia_Representantes_Regioes.md`, seção 3). Só
 * leitura, usada para montar o checklist de municípios de uma área
 * comercial.
 */
export function listStatesWithMunicipalities() {
  return prisma.state.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      uf: true,
      municipalities: { orderBy: { name: 'asc' }, select: { id: true, name: true } },
    },
  })
}
