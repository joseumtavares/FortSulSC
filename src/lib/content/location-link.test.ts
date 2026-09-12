import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildLocationMapLink, parseLocationLinkInput, resolveLocationLink } from './location-link'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseLocationLinkInput', () => {
  it('accepts a Google Maps link', () => {
    expect(parseLocationLinkInput('https://www.google.com/maps/@-27.123456,-48.654321,17z')).toBe(
      'https://www.google.com/maps/@-27.123456,-48.654321,17z',
    )
  })

  it('accepts a short Google Maps link', () => {
    expect(parseLocationLinkInput('https://maps.app.goo.gl/abc123')).toBe('https://maps.app.goo.gl/abc123')
  })

  it('returns null for empty input', () => {
    expect(parseLocationLinkInput('')).toBeNull()
    expect(parseLocationLinkInput(null)).toBeNull()
  })

  it.each(['not a url', 'https://evil.example.com/@-27,-48', 'http://maps.google.com/@-27,-48'])(
    'rejects invalid or untrusted input: %s',
    (input) => {
      expect(() => parseLocationLinkInput(input)).toThrow()
    },
  )
})

describe('resolveLocationLink', () => {
  it('extracts coordinates directly from a long Google Maps URL (@lat,lng)', async () => {
    const result = await resolveLocationLink('https://www.google.com/maps/@-27.123456,-48.654321,17z')
    expect(result).toEqual({ lat: -27.123456, lng: -48.654321 })
  })

  it('extracts coordinates from a Google Maps ?q= URL', async () => {
    const result = await resolveLocationLink('https://www.google.com/maps?q=-27.123456,-48.654321')
    expect(result).toEqual({ lat: -27.123456, lng: -48.654321 })
  })

  it('extracts coordinates from an Apple Maps ?ll= URL', async () => {
    const result = await resolveLocationLink('https://maps.apple.com/?ll=-27.123456,-48.654321')
    expect(result).toEqual({ lat: -27.123456, lng: -48.654321 })
  })

  it('follows a short link redirect and extracts coordinates from the final URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ url: 'https://www.google.com/maps/@-27.5,-48.5,15z' }),
    )
    const result = await resolveLocationLink('https://maps.app.goo.gl/abc123')
    expect(result).toEqual({ lat: -27.5, lng: -48.5 })
  })

  it('rejects when the short link redirects outside known map hosts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ url: 'https://evil.example.com/@-27.5,-48.5' }))
    await expect(resolveLocationLink('https://maps.app.goo.gl/abc123')).rejects.toThrow()
  })

  it('rejects when no coordinates can be found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ url: 'https://www.google.com/maps/place/Somewhere' }))
    await expect(resolveLocationLink('https://maps.app.goo.gl/abc123')).rejects.toThrow()
  })
})

describe('buildLocationMapLink', () => {
  it('builds a Google Maps link from coordinates', () => {
    expect(buildLocationMapLink(-27.12, -48.65)).toBe('https://www.google.com/maps?q=-27.12,-48.65')
  })
})
