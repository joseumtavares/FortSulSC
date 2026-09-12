import { describe, expect, it, vi } from 'vitest'

const partnerMock = vi.hoisted(() => ({ findMany: vi.fn() }))
const rateLimitMock = vi.hoisted(() => vi.fn())
vi.mock('@/lib/db/client', () => ({ prisma: { partner: partnerMock } }))
vi.mock('@/lib/auth/rate-limit', () => ({ checkAndIncrementRateLimit: rateLimitMock }))

import { checkPublicPartnersRateLimit, listPublicPartners } from './partner-public-repository'

const rawPartner = {
  id: 'p1',
  type: 'REPRESENTATIVE' as const,
  name: 'Fulano de Tal',
  description: 'Atende a região sul.',
  whatsapp: '5548999990000',
  websiteUrl: null,
  logoUrl: 'https://cdn.example/logo.webp',
  approximateLat: -27.6,
  approximateLng: -48.55,
  socialLinks: { instagram: 'https://instagram.com/fulano' },
  commercialAreas: [
    {
      commercialArea: {
        municipalities: [{ municipality: { name: 'Tubarão' } }, { municipality: { name: 'Orleans' } }],
      },
    },
    {
      commercialArea: {
        municipalities: [{ municipality: { name: 'Orleans' } }],
      },
    },
  ],
}

describe('listPublicPartners', () => {
  it('selects only public fields and only active partners', async () => {
    partnerMock.findMany.mockResolvedValue([rawPartner])
    await listPublicPartners()
    const call = partnerMock.findMany.mock.calls[0]?.[0]
    expect(call.where).toEqual({ active: true })
    expect(call.select).not.toHaveProperty('private')
    expect(call.select).toMatchObject({
      id: true,
      type: true,
      name: true,
      description: true,
      whatsapp: true,
      websiteUrl: true,
      logoUrl: true,
      approximateLat: true,
      approximateLng: true,
      socialLinks: true,
    })
  })

  it('flattens and deduplicates municipality names across commercial areas, sorted alphabetically', async () => {
    partnerMock.findMany.mockResolvedValue([rawPartner])
    const [result] = await listPublicPartners()
    expect(result.municipalities).toEqual(['Orleans', 'Tubarão'])
  })

  it('does not select private/internal fields (document, consentNotes, logoKey)', async () => {
    partnerMock.findMany.mockResolvedValue([rawPartner])
    await listPublicPartners()
    const call = partnerMock.findMany.mock.calls[0]?.[0]
    expect(call.select).not.toHaveProperty('private')
    expect(call.select).not.toHaveProperty('logoKey')
  })

  it('defaults null socialLinks', async () => {
    partnerMock.findMany.mockResolvedValue([{ ...rawPartner, socialLinks: null }])
    const [result] = await listPublicPartners()
    expect(result.socialLinks).toBeNull()
  })
})

describe('checkPublicPartnersRateLimit', () => {
  it('checks the IP dimension under the PARTNERS_READ context', async () => {
    rateLimitMock.mockResolvedValue({ allowed: true, count: 1, windowStart: new Date(), retryAfterMs: 0 })
    await checkPublicPartnersRateLimit('203.0.113.7')
    expect(rateLimitMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ dimension: 'IP', key: '203.0.113.7', context: 'PARTNERS_READ' }),
    )
  })
})
