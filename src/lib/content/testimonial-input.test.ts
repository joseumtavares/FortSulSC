import { describe, expect, it } from 'vitest'
import { parseTestimonialInput } from './testimonial-input'
import { MAX_TESTIMONIAL_AUTHOR_NAME_LENGTH } from './text-limits'

describe('parseTestimonialInput', () => {
  it('accepts a valid link matching the platform domain', () => {
    expect(
      parseTestimonialInput({ platform: 'tiktok', url: 'https://www.tiktok.com/@fortsul/video/123', authorName: ' Parceiro X ' }),
    ).toEqual({ platform: 'TIKTOK', url: 'https://www.tiktok.com/@fortsul/video/123', authorName: 'Parceiro X' })
  })

  it('accepts omitted author name as null', () => {
    expect(parseTestimonialInput({ platform: 'INSTAGRAM', url: 'https://instagram.com/p/abc' })).toEqual({
      platform: 'INSTAGRAM',
      url: 'https://instagram.com/p/abc',
      authorName: null,
    })
  })

  it.each([
    null,
    { platform: 'youtube', url: 'https://youtube.com/watch?v=1' },
    { platform: 'FACEBOOK', url: 'http://facebook.com/post/1' },
    { platform: 'FACEBOOK', url: 'https://instagram.com/post/1' },
    { platform: 'TIKTOK', url: 'not a url' },
    { platform: 'TIKTOK', url: '' },
  ])('rejects invalid input: %j', (input) => {
    expect(() => parseTestimonialInput(input)).toThrow()
  })

  it('rejects an author name longer than the character limit', () => {
    expect(() =>
      parseTestimonialInput({
        platform: 'TIKTOK',
        url: 'https://www.tiktok.com/@fortsul/video/123',
        authorName: 'A'.repeat(MAX_TESTIMONIAL_AUTHOR_NAME_LENGTH + 1),
      }),
    ).toThrow()
  })
})
