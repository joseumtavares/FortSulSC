import { describe, expect, it } from 'vitest'
import { parseProductInput } from './product-input'

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
})
