import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryStrip } from './CategoryStrip'

describe('CategoryStrip', () => {
  it('renderiza as cinco categorias do baseline na ordem aprovada', () => {
    render(<CategoryStrip />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(links.map((link) => link.textContent)).toEqual([
      '01Aviário', '02Secadores', '03Fumageiro', '04Piscicultura', '05Equipamentos',
    ])
    expect(links.every((link) => link.getAttribute('href') === '#solucoes')).toBe(true)
    expect(screen.getByRole('region', { name: 'Áreas de atuação' })).toBeTruthy()
  })
})
