import { describe, expect, it } from 'vitest'
import { haversineKm, locatedPartners, nearestPartners, partnerPopupLabel } from './partner-geo'
import type { PublicPartner } from './partner-public-repository'

function partner(overrides: Partial<PublicPartner> & { id: string }): PublicPartner {
  return {
    type: 'REPRESENTATIVE',
    name: 'Fulano',
    description: null,
    whatsapp: '5548999990000',
    websiteUrl: null,
    logoUrl: null,
    approximateLat: null,
    approximateLng: null,
    socialLinks: null,
    municipalities: [],
    ...overrides,
  }
}

describe('haversineKm', () => {
  it('returns ~0 for the same point', () => {
    expect(haversineKm({ lat: -27.6, lng: -48.55 }, { lat: -27.6, lng: -48.55 })).toBeCloseTo(0, 5)
  })

  it('returns the known distance between two real cities (Florianópolis to Curitiba, ~240km)', () => {
    const distance = haversineKm({ lat: -27.5954, lng: -48.548 }, { lat: -25.4284, lng: -49.2733 })
    expect(distance).toBeGreaterThan(200)
    expect(distance).toBeLessThan(280)
  })
})

describe('locatedPartners', () => {
  it('keeps only partners with both coordinates set', () => {
    const partners = [
      partner({ id: 'p1', approximateLat: -27.6, approximateLng: -48.55 }),
      partner({ id: 'p2', approximateLat: null, approximateLng: null }),
      partner({ id: 'p3', approximateLat: -25.4, approximateLng: null }),
    ]
    expect(locatedPartners(partners).map((p) => p.id)).toEqual(['p1'])
  })
})

describe('nearestPartners', () => {
  it('sorts by distance and respects the limit', () => {
    const near = partner({ id: 'near', approximateLat: -27.6, approximateLng: -48.55 })
    const far = partner({ id: 'far', approximateLat: -3.7, approximateLng: -38.5 })
    const mid = partner({ id: 'mid', approximateLat: -25.4, approximateLng: -49.2 })
    const result = nearestPartners(locatedPartners([far, near, mid]), { lat: -27.5954, lng: -48.548 }, 2)
    expect(result.map((p) => p.id)).toEqual(['near', 'mid'])
  })
})

describe('partnerPopupLabel', () => {
  it('labels representatives as authorized representative', () => {
    expect(partnerPopupLabel('REPRESENTATIVE')).toBe('Representante autorizado')
  })

  it('labels resellers as authorized reseller', () => {
    expect(partnerPopupLabel('RESELLER')).toBe('Revendedor autorizado')
  })
})
