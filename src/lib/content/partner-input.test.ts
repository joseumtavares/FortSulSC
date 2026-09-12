import { describe, expect, it } from 'vitest'
import { parsePartnerInput } from './partner-input'
import { MAX_PARTNER_DESCRIPTION_LENGTH, MAX_PARTNER_NAME_LENGTH } from './text-limits'

const valid = { type: 'representative', name: ' Fulano de Tal ', whatsapp: ' 5548999990000 ' }

describe('parsePartnerInput', () => {
  it('normalizes required and optional fields', () => {
    expect(
      parsePartnerInput({
        ...valid,
        description: ' Representante regional. ',
        websiteUrl: ' https://example.com ',
        approximateLat: -27.123456,
        approximateLng: -49.654321,
        socialLinks: { instagram: 'https://instagram.com/fulano' },
      }),
    ).toEqual({
      type: 'REPRESENTATIVE',
      name: 'Fulano de Tal',
      whatsapp: '5548999990000',
      description: 'Representante regional.',
      websiteUrl: 'https://example.com',
      approximateLat: -27.12,
      approximateLng: -49.65,
      socialLinks: { instagram: 'https://instagram.com/fulano' },
    })
  })

  it('defaults optional fields to null when omitted', () => {
    expect(parsePartnerInput(valid)).toEqual({
      type: 'REPRESENTATIVE',
      name: 'Fulano de Tal',
      whatsapp: '5548999990000',
      description: null,
      websiteUrl: null,
      approximateLat: null,
      approximateLng: null,
      socialLinks: undefined,
    })
  })

  it('accepts RESELLER as a type', () => {
    expect(parsePartnerInput({ ...valid, type: 'reseller' }).type).toBe('RESELLER')
  })

  it.each([
    null,
    { ...valid, type: 'owner' },
    { ...valid, name: '' },
    { ...valid, whatsapp: '' },
    { ...valid, websiteUrl: 'javascript:alert(1)' },
    { ...valid, approximateLat: 'north' },
    { ...valid, approximateLat: 200 },
    { ...valid, approximateLng: -200 },
  ])('rejects invalid input: %j', (input) => {
    expect(() => parsePartnerInput(input)).toThrow()
  })

  it('rejects fields longer than their character limit', () => {
    expect(() => parsePartnerInput({ ...valid, name: 'A'.repeat(MAX_PARTNER_NAME_LENGTH + 1) })).toThrow()
    expect(() => parsePartnerInput({ ...valid, description: 'A'.repeat(MAX_PARTNER_DESCRIPTION_LENGTH + 1) })).toThrow()
  })

  it('rounds coordinates to ~1km precision (2 decimal places)', () => {
    const result = parsePartnerInput({ ...valid, approximateLat: -27.987654, approximateLng: -48.123456 })
    expect(result.approximateLat).toBe(-27.99)
    expect(result.approximateLng).toBe(-48.12)
  })
})
