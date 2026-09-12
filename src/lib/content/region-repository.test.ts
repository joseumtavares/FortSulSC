import { describe, expect, it, vi } from 'vitest'

const stateMock = vi.hoisted(() => ({ findMany: vi.fn() }))
vi.mock('@/lib/db/client', () => ({ prisma: { state: stateMock } }))

import { listStatesWithMunicipalities } from './region-repository'

describe('listStatesWithMunicipalities', () => {
  it('lists states ordered by name with their municipalities ordered by name', async () => {
    await listStatesWithMunicipalities()
    expect(stateMock.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        uf: true,
        municipalities: { orderBy: { name: 'asc' }, select: { id: true, name: true } },
      },
    })
  })
})
