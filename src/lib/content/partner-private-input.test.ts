import { describe, expect, it } from 'vitest'
import { parsePartnerPrivateInput } from './partner-private-input'
import { MAX_PARTNER_CONSENT_NOTES_LENGTH, MAX_PARTNER_DOCUMENT_LENGTH } from './text-limits'

describe('parsePartnerPrivateInput', () => {
  it('normalizes optional fields', () => {
    expect(parsePartnerPrivateInput({ document: ' 123.456.789-00 ', consentNotes: ' Consentiu por e-mail. ' })).toEqual({
      document: '123.456.789-00',
      consentNotes: 'Consentiu por e-mail.',
    })
  })

  it('defaults empty fields to null', () => {
    expect(parsePartnerPrivateInput({ document: '', consentNotes: '' })).toEqual({ document: null, consentNotes: null })
  })

  it('rejects null input', () => {
    expect(() => parsePartnerPrivateInput(null)).toThrow()
  })

  it('rejects fields longer than their character limit', () => {
    expect(() => parsePartnerPrivateInput({ document: 'A'.repeat(MAX_PARTNER_DOCUMENT_LENGTH + 1) })).toThrow()
    expect(() => parsePartnerPrivateInput({ consentNotes: 'A'.repeat(MAX_PARTNER_CONSENT_NOTES_LENGTH + 1) })).toThrow()
  })
})
