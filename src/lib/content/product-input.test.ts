import { describe, expect, it } from 'vitest'
import { parseProductInput } from './product-input'
import { MAX_PRODUCT_CODE_LENGTH, MAX_PRODUCT_EYEBROW_LENGTH, MAX_PRODUCT_NAME_LENGTH, MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH } from './text-limits'

const valid = { code: ' ALM-001 ', name: ' Alimentador de cavaco ' }

describe('parseProductInput', () => {
  it('normalizes required and optional fields', () => {
    expect(
      parseProductInput({
        ...valid,
        eyebrow: ' Lançamento ',
        shortDescription: '',
        description: null,
        catalogUrl: ' https://cdn.example/catalogo.pdf ',
        whatsappMessageTemplate: ' Olá! Quero saber mais sobre {produto}. ',
      }),
    ).toEqual({
      code: 'ALM-001',
      name: 'Alimentador de cavaco',
      eyebrow: 'Lançamento',
      shortDescription: null,
      description: null,
      catalogUrl: 'https://cdn.example/catalogo.pdf',
      whatsappMessageTemplate: 'Olá! Quero saber mais sobre {produto}.',
    })
  })

  it('defaults optional fields to null when omitted', () => {
    expect(parseProductInput(valid)).toEqual({
      code: 'ALM-001',
      name: 'Alimentador de cavaco',
      eyebrow: null,
      shortDescription: null,
      description: null,
      catalogUrl: null,
      whatsappMessageTemplate: null,
    })
  })

  it.each([null, { ...valid, code: '' }, { ...valid, name: '' }, { ...valid, catalogUrl: 'javascript:alert(1)' }, { ...valid, catalogUrl: 'not a url' }])(
    'rejects invalid input: %j',
    (input) => {
      expect(() => parseProductInput(input)).toThrow()
    },
  )

  it('rejects fields longer than their character limit', () => {
    expect(() => parseProductInput({ ...valid, code: 'A'.repeat(MAX_PRODUCT_CODE_LENGTH + 1) })).toThrow()
    expect(() => parseProductInput({ ...valid, name: 'A'.repeat(MAX_PRODUCT_NAME_LENGTH + 1) })).toThrow()
    expect(() => parseProductInput({ ...valid, eyebrow: 'A'.repeat(MAX_PRODUCT_EYEBROW_LENGTH + 1) })).toThrow()
    expect(() => parseProductInput({ ...valid, shortDescription: 'A'.repeat(MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH + 1) })).toThrow()
  })

  it('accepts fields at exactly the character limit', () => {
    expect(() => parseProductInput({ ...valid, name: 'A'.repeat(MAX_PRODUCT_NAME_LENGTH) })).not.toThrow()
  })
})
