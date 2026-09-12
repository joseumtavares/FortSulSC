import { describe, expect, it } from 'vitest'
import {
  PARTNER_DOCUMENT_SIGNED_TEXT,
  PARTNER_LGPD_AUTHORIZATION_TEXT,
  parsePartnerPrivateInput,
} from './partner-private-input'

describe('parsePartnerPrivateInput', () => {
  it('maps checked boxes to their fixed declaration text', () => {
    expect(parsePartnerPrivateInput({ documentSigned: true, lgpdAuthorized: true })).toEqual({
      document: PARTNER_DOCUMENT_SIGNED_TEXT,
      consentNotes: PARTNER_LGPD_AUTHORIZATION_TEXT,
    })
  })

  it('defaults unchecked boxes to null', () => {
    expect(parsePartnerPrivateInput({ documentSigned: false, lgpdAuthorized: false })).toEqual({
      document: null,
      consentNotes: null,
    })
  })

  it('treats missing fields as unchecked', () => {
    expect(parsePartnerPrivateInput({})).toEqual({ document: null, consentNotes: null })
  })

  it('ignores non-boolean truthy values (only literal true checks the box)', () => {
    expect(parsePartnerPrivateInput({ documentSigned: 'true', lgpdAuthorized: 1 })).toEqual({
      document: null,
      consentNotes: null,
    })
  })

  it('rejects null input', () => {
    expect(() => parsePartnerPrivateInput(null)).toThrow()
  })
})
