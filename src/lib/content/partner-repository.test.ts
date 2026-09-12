import { beforeEach, describe, expect, it, vi } from 'vitest'

const partnerMock = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }))
const partnerPrivateMock = vi.hoisted(() => ({ upsert: vi.fn() }))
const partnerCommercialAreaMock = vi.hoisted(() => ({ deleteMany: vi.fn(), createMany: vi.fn() }))
const transactionMock = vi.hoisted(() => vi.fn((operations: unknown[]) => Promise.resolve(operations)))

vi.mock('@/lib/db/client', () => ({
  prisma: {
    partner: partnerMock,
    partnerPrivate: partnerPrivateMock,
    partnerCommercialArea: partnerCommercialAreaMock,
    $transaction: transactionMock,
  },
}))

import {
  createPartner,
  deletePartner,
  findPartnerForAdmin,
  listPartnersForAdmin,
  setPartnerCommercialAreas,
  updatePartner,
  updatePartnerActive,
  updatePartnerLogo,
  upsertPartnerPrivate,
} from './partner-repository'

const textInput = {
  type: 'REPRESENTATIVE' as const,
  name: 'Fulano de Tal',
  description: null,
  whatsapp: '5548999990000',
  socialLinks: null,
  websiteUrl: null,
  approximateLat: null,
  approximateLng: null,
  locationLink: null,
}

describe('partner-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation((operations: unknown[]) => Promise.resolve(operations))
  })

  it('lists all partners when no type filter is given', async () => {
    await listPartnersForAdmin()
    expect(partnerMock.findMany).toHaveBeenCalledWith({ where: undefined, orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }] })
  })

  it('filters partners by type', async () => {
    await listPartnersForAdmin('RESELLER')
    expect(partnerMock.findMany).toHaveBeenCalledWith({ where: { type: 'RESELLER' }, orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }] })
  })

  it('finds a partner for admin with private data and commercial areas', async () => {
    await findPartnerForAdmin('p1')
    expect(partnerMock.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: { private: true, commercialAreas: { select: { commercialAreaId: true } } },
    })
  })

  it('creates a partner, converting explicit null socialLinks to Prisma.DbNull', async () => {
    await createPartner(textInput)
    const call = partnerMock.create.mock.calls[0]?.[0]
    expect(call.data.name).toBe('Fulano de Tal')
    expect(call.data.socialLinks).not.toBeNull()
    expect(String(call.data.socialLinks)).toContain('DbNull')
  })

  it('never sends locationLink to Prisma (it is not a column)', async () => {
    await createPartner({ ...textInput, locationLink: 'https://www.google.com/maps/@-27.5,-48.5' })
    const call = partnerMock.create.mock.calls[0]?.[0]
    expect(call.data).not.toHaveProperty('locationLink')
  })

  it('updates a partner text fields', async () => {
    await updatePartner('p1', { ...textInput, socialLinks: { instagram: 'https://instagram.com/x' } })
    expect(partnerMock.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: expect.objectContaining({ socialLinks: { instagram: 'https://instagram.com/x' } }) })
  })

  it('updates only active', async () => {
    await updatePartnerActive('p1', true)
    expect(partnerMock.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { active: true } })
  })

  it('updates the logo url and key together', async () => {
    await updatePartnerLogo('p1', 'https://cdn.example/logo.webp', 'partners/p1/a.webp')
    expect(partnerMock.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { logoUrl: 'https://cdn.example/logo.webp', logoKey: 'partners/p1/a.webp' } })
  })

  it('deletes a partner by id', async () => {
    await deletePartner('p1')
    expect(partnerMock.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
  })

  it('replaces commercial area links atomically', async () => {
    await setPartnerCommercialAreas('p1', ['a1', 'a2'])
    expect(transactionMock).toHaveBeenCalled()
    expect(partnerCommercialAreaMock.deleteMany).toHaveBeenCalledWith({ where: { partnerId: 'p1' } })
    expect(partnerCommercialAreaMock.createMany).toHaveBeenCalledWith({
      data: [{ partnerId: 'p1', commercialAreaId: 'a1' }, { partnerId: 'p1', commercialAreaId: 'a2' }],
    })
  })

  it('sets consentGivenAt only on first creation of private data', async () => {
    await upsertPartnerPrivate('p1', { document: '123', consentNotes: 'ok' })
    expect(partnerPrivateMock.upsert).toHaveBeenCalledWith({
      where: { partnerId: 'p1' },
      update: { document: '123', consentNotes: 'ok' },
      create: expect.objectContaining({ partnerId: 'p1', document: '123', consentNotes: 'ok', consentGivenAt: expect.any(Date) }),
    })
  })
})
