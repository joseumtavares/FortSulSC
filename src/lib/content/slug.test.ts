import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('converte para minúsculas e troca espaços por hífen', () => {
    expect(slugify('Manutenção de Secadores')).toBe('manutencao-de-secadores')
  })

  it('remove acentos', () => {
    expect(slugify('Fumigação e Aviário')).toBe('fumigacao-e-aviario')
  })

  it('remove pontuação e caracteres não alfanuméricos', () => {
    expect(slugify('Dicas: como escolher o alimentador ideal?!')).toBe(
      'dicas-como-escolher-o-alimentador-ideal',
    )
  })

  it('remove hífens duplicados e nas bordas', () => {
    expect(slugify('  --Título   com --- espaços--  ')).toBe('titulo-com-espacos')
  })
})
