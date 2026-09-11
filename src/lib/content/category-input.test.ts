import { describe, expect, it } from 'vitest'
import { parseCategoryInput } from './category-input'
import { MAX_CATEGORY_NAME_LENGTH } from './text-limits'

describe('parseCategoryInput', () => {
  it('normalizes valid input', () => {
    expect(parseCategoryInput({ name: ' Aviário ', slug: 'aviario', order: 2.7 })).toEqual({
      name: 'Aviário',
      slug: 'aviario',
      order: 2,
    })
  })

  it('defaults order to 0 when omitted', () => {
    expect(parseCategoryInput({ name: 'Equipamentos', slug: 'equipamentos' })).toEqual({
      name: 'Equipamentos',
      slug: 'equipamentos',
      order: 0,
    })
  })

  it.each([null, { name: '', slug: 'ok' }, { name: 'Ok', slug: '' }, { name: 'Ok', slug: 'Slug Inválido' }, { name: 'Ok', slug: 'Equipamentos' }])(
    'rejects invalid input: %j',
    (input) => {
      expect(() => parseCategoryInput(input)).toThrow()
    },
  )

  it('rejects a name longer than the character limit', () => {
    expect(() => parseCategoryInput({ name: 'A'.repeat(MAX_CATEGORY_NAME_LENGTH + 1), slug: 'ok' })).toThrow()
  })

  it('accepts a name at exactly the character limit', () => {
    expect(() => parseCategoryInput({ name: 'A'.repeat(MAX_CATEGORY_NAME_LENGTH), slug: 'ok' })).not.toThrow()
  })
})
