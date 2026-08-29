import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

  it('mantém os divisores estruturais e o último item ímpar genérico no mobile', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

    expect(styles).toContain('column-gap: 1px')
    expect(styles).toContain('repeat(2, minmax(0, 1fr))')
    expect(styles).toContain('.category-grid a:last-child:nth-child(odd)')
    expect(styles).not.toContain('.category-grid a:first-child')
    expect(styles).not.toContain('.category-grid a:nth-child(even)')
    expect(styles).not.toContain('.category-grid a:nth-child(odd):not(:last-child)')
  })
})
