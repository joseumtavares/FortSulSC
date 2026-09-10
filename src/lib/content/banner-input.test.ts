import { describe, expect, it } from 'vitest'
import { parseBannerInput } from './banner-input'

const valid = { title: ' Banner ', altText: ' Imagem institucional ', linkUrl: '', startAt: '', endAt: '' }
describe('parseBannerInput', () => {
  it('normalizes optional fields and excludes protected properties', () => {
    expect(parseBannerInput({ ...valid, active: true, imageKey: 'injected', order: 5 })).toEqual({ title: 'Banner', altText: 'Imagem institucional', linkUrl: null, startAt: null, endAt: null })
  })
  it.each([{ ...valid, title: '' }, { ...valid, altText: '' }, { ...valid, startAt: 'invalid' }, { ...valid, startAt: '2026-10-03T00:00:00Z', endAt: '2026-10-01T00:00:00Z' }, { ...valid, linkUrl: 'javascript:alert(1)' }, null])('rejects invalid input: %j', (input) => {
    expect(() => parseBannerInput(input)).toThrow()
  })
})
