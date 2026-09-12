import { describe, expect, it } from 'vitest'
import { detectImageMimeType, matchesDeclaredImageType } from './image-signature'

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01])
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
const WEBP = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
const GARBAGE = Buffer.from([1, 2, 3, 4, 5])

describe('detectImageMimeType', () => {
  it('detects JPEG by its magic bytes', () => {
    expect(detectImageMimeType(JPEG)).toBe('image/jpeg')
  })

  it('detects PNG by its magic bytes', () => {
    expect(detectImageMimeType(PNG)).toBe('image/png')
  })

  it('detects WEBP by its RIFF/WEBP markers', () => {
    expect(detectImageMimeType(WEBP)).toBe('image/webp')
  })

  it('returns null for content with no recognized signature', () => {
    expect(detectImageMimeType(GARBAGE)).toBeNull()
  })

  it('returns null for content shorter than the signature it claims to be', () => {
    expect(detectImageMimeType(Buffer.from([0xff, 0xd8]))).toBeNull()
  })
})

describe('matchesDeclaredImageType', () => {
  it('accepts content whose signature matches the declared MIME type', () => {
    expect(matchesDeclaredImageType(JPEG, 'image/jpeg')).toBe(true)
  })

  it('rejects content whose signature does not match the declared MIME type', () => {
    expect(matchesDeclaredImageType(PNG, 'image/jpeg')).toBe(false)
  })

  it('rejects unrecognized content regardless of the declared type', () => {
    expect(matchesDeclaredImageType(GARBAGE, 'image/jpeg')).toBe(false)
  })
})
