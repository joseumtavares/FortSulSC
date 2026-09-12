import { describe, expect, it } from 'vitest'
import { parseCommercialAreaInput } from './commercial-area-input'
import { MAX_COMMERCIAL_AREA_NAME_LENGTH } from './text-limits'

describe('parseCommercialAreaInput', () => {
  it('normalizes a valid name', () => {
    expect(parseCommercialAreaInput({ name: ' Grande Florianópolis ' })).toEqual({ name: 'Grande Florianópolis' })
  })

  it.each([null, { name: '' }, { name: '   ' }])('rejects invalid input: %j', (input) => {
    expect(() => parseCommercialAreaInput(input)).toThrow()
  })

  it('rejects a name longer than the character limit', () => {
    expect(() => parseCommercialAreaInput({ name: 'A'.repeat(MAX_COMMERCIAL_AREA_NAME_LENGTH + 1) })).toThrow()
  })

  it('accepts a name at exactly the character limit', () => {
    expect(() => parseCommercialAreaInput({ name: 'A'.repeat(MAX_COMMERCIAL_AREA_NAME_LENGTH) })).not.toThrow()
  })
})
