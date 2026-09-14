import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const partnerMock = vi.hoisted(() => ({ findMany: vi.fn() }))
const rateLimitMock = vi.hoisted(() => vi.fn())
const loggerMock = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }))
vi.mock('@/lib/db/client', () => ({ prisma: { partner: partnerMock } }))
vi.mock('@/lib/auth/rate-limit', () => ({ checkAndIncrementRateLimit: rateLimitMock }))
vi.mock('@/lib/logger', () => ({ logger: loggerMock }))

import { checkPublicPartnersRateLimit, listPublicPartners, resetPublicPartnersCacheForTests } from './partner-public-repository'

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
  beforeEach(() => {
    resetPublicPartnersCacheForTests()
    loggerMock.error.mockClear()
  })

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

  it('limits the query to 500 partners (rede de segurança, não paginação)', async () => {
    partnerMock.findMany.mockResolvedValue([rawPartner])
    await listPublicPartners()
    const call = partnerMock.findMany.mock.calls[0]?.[0]
    expect(call.take).toBe(500)
  })

  it('logs a warning when the result hits the cap exactly, without truncating the response itself', async () => {
    partnerMock.findMany.mockResolvedValue(Array.from({ length: 500 }, (_, i) => ({ ...rawPartner, id: `p${i}` })))
    const result = await listPublicPartners()
    expect(result).toHaveLength(500)
    expect(loggerMock.error).toHaveBeenCalledWith('public.partners_list_truncated', { limit: 500 })
  })

  it('does not log when the result is below the cap', async () => {
    partnerMock.findMany.mockResolvedValue([rawPartner])
    await listPublicPartners()
    expect(loggerMock.error).not.toHaveBeenCalled()
  })

  describe('cache de 2 minutos', () => {
    beforeEach(() => {
      partnerMock.findMany.mockClear()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-14T12:00:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('não consulta o banco de novo enquanto o cache estiver dentro do TTL', async () => {
      partnerMock.findMany.mockResolvedValue([rawPartner])

      await listPublicPartners()
      vi.setSystemTime(new Date('2026-09-14T12:01:59.000Z')) // 1min59s depois
      await listPublicPartners()

      expect(partnerMock.findMany).toHaveBeenCalledTimes(1)
    })

    it('consulta o banco de novo depois do TTL de 2 minutos expirar', async () => {
      partnerMock.findMany.mockResolvedValue([rawPartner])

      await listPublicPartners()
      vi.setSystemTime(new Date('2026-09-14T12:02:00.001Z')) // 2min00s001ms depois
      await listPublicPartners()

      expect(partnerMock.findMany).toHaveBeenCalledTimes(2)
    })
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
