import { describe, expect, it } from 'vitest'
import { isKnownMunicipio, REGIAO_SUL_MUNICIPIOS, searchMunicipios } from './regiao-sul-municipios'

describe('REGIAO_SUL_MUNICIPIOS', () => {
  it('includes all 1191 municipalities from the three southern states', () => {
    expect(REGIAO_SUL_MUNICIPIOS.length).toBe(1191)
    expect(new Set(REGIAO_SUL_MUNICIPIOS.map((m) => m.uf))).toEqual(new Set(['PR', 'SC', 'RS']))
  })
})

describe('isKnownMunicipio', () => {
  it('recognizes a real municipality regardless of case', () => {
    expect(isKnownMunicipio('orleans')).toBe(true)
    expect(isKnownMunicipio('Orleans')).toBe(true)
  })

  it('rejects a name that is not a real municipality', () => {
    expect(isKnownMunicipio('Cidade Inventada Xyz')).toBe(false)
  })
})

describe('searchMunicipios', () => {
  it('returns matches containing the search term, case-insensitively', () => {
    const results = searchMunicipios('orlea', 5)
    expect(results.some((m) => m.name === 'Orleans')).toBe(true)
  })

  it('returns an empty array for a blank query', () => {
    expect(searchMunicipios('   ', 5)).toEqual([])
  })

  it('respects the limit', () => {
    const results = searchMunicipios('a', 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })
})
