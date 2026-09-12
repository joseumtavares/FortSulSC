import { beforeEach, describe, expect, it, vi } from 'vitest'

const commercialAreaMock = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }))
const commercialAreaMunicipalityMock = vi.hoisted(() => ({ deleteMany: vi.fn(), createMany: vi.fn() }))
const transactionMock = vi.hoisted(() => vi.fn((operations: unknown[]) => Promise.resolve(operations)))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    commercialArea: commercialAreaMock,
    commercialAreaMunicipality: commercialAreaMunicipalityMock,
    $transaction: transactionMock,
  },
}))

import {
  createCommercialArea,
  deleteCommercialArea,
  findCommercialAreaForAdmin,
  generateUniqueCommercialAreaSlug,
  listCommercialAreasForAdmin,
  setCommercialAreaMunicipalities,
  updateCommercialArea,
} from './commercial-area-repository'

describe('commercial-area-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation((operations: unknown[]) => Promise.resolve(operations))
  })

  it('generates the base slug when it is free', async () => {
    commercialAreaMock.findUnique.mockResolvedValueOnce(null)
    expect(await generateUniqueCommercialAreaSlug('Grande Florianópolis')).toBe('grande-florianopolis')
  })

  it('appends a numeric suffix on slug collision', async () => {
    commercialAreaMock.findUnique.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null)
    expect(await generateUniqueCommercialAreaSlug('Vale')).toBe('vale-2')
  })

  it('creates a commercial area with a generated slug', async () => {
    commercialAreaMock.findUnique.mockResolvedValueOnce(null)
    commercialAreaMock.create.mockResolvedValueOnce({ id: 'a1' })
    await createCommercialArea({ name: 'Vale do Itajaí' })
    expect(commercialAreaMock.create).toHaveBeenCalledWith({ data: { name: 'Vale do Itajaí', slug: 'vale-do-itajai' } })
  })

  it('lists commercial areas with linked municipalities', async () => {
    await listCommercialAreasForAdmin()
    expect(commercialAreaMock.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      include: { municipalities: { select: { municipalityId: true } } },
    })
  })

  it('finds a commercial area for admin with linked municipalities', async () => {
    await findCommercialAreaForAdmin('a1')
    expect(commercialAreaMock.findUnique).toHaveBeenCalledWith({
      where: { id: 'a1' },
      include: { municipalities: { select: { municipalityId: true } } },
    })
  })

  it('updates a commercial area', async () => {
    await updateCommercialArea('a1', { name: 'Novo nome' })
    expect(commercialAreaMock.update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { name: 'Novo nome' } })
  })

  it('deletes a commercial area by id', async () => {
    await deleteCommercialArea('a1')
    expect(commercialAreaMock.delete).toHaveBeenCalledWith({ where: { id: 'a1' } })
  })

  it('replaces municipality links atomically', async () => {
    await setCommercialAreaMunicipalities('a1', ['m1', 'm2'])
    expect(transactionMock).toHaveBeenCalled()
    expect(commercialAreaMunicipalityMock.deleteMany).toHaveBeenCalledWith({ where: { commercialAreaId: 'a1' } })
    expect(commercialAreaMunicipalityMock.createMany).toHaveBeenCalledWith({
      data: [{ commercialAreaId: 'a1', municipalityId: 'm1' }, { commercialAreaId: 'a1', municipalityId: 'm2' }],
    })
  })
})
