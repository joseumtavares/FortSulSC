import { describe, expect, it } from 'vitest'
import { parseSocialLinks } from './social-links'

describe('parseSocialLinks', () => {
  it('preserves omission and accepts empty or null values', () => {
    expect(parseSocialLinks(undefined)).toBeUndefined()
    expect(parseSocialLinks(null)).toBeNull()
    expect(parseSocialLinks({})).toEqual({})
    expect(parseSocialLinks({ facebook: null })).toEqual({})
  })
  it('accepts the four optional HTTPS links without a domain restriction', () => {
    const links = { facebook: 'https://facebook.com/fortsul', instagram: 'https://instagram.com/fortsul', linkedin: 'https://linkedin.com/company/fortsul', youtube: 'https://youtu.be/example' }
    expect(parseSocialLinks(links)).toEqual(links)
  })
  it.each([[], 'text', 2, { unknown: 'https://example.com' }, { facebook: false }, { facebook: 'http://facebook.com' }, { instagram: 'https://' }, { youtube: 'javascript:alert(1)' }])('rejects malformed social links: %j', (input) => {
    expect(() => parseSocialLinks(input)).toThrow()
  })
})
