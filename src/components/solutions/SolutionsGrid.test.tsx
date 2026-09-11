import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SolutionsGrid } from './SolutionsGrid'
import type { SolutionCardData, SolutionFilter } from './solutions-data'

const filters: SolutionFilter[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aviario', label: 'Aviário' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'fumageiro', label: 'Fumageiro' },
]

function makeProduct(id: string, categorySlugs: string[]): SolutionCardData {
  return {
    id, code: id.toUpperCase(), name: `Produto ${id}`, eyebrow: null, shortDescription: null, description: null,
    catalogUrl: null, categorySlugs, applications: [], specifications: [],
    heroImage: null, gallery: [], testimonials: [], whatsappLink: 'https://wa.me/554836600818?text=x',
  }
}

const solutions: SolutionCardData[] = [
  makeProduct('alimentador', ['equipamentos', 'fumageiro']),
  makeProduct('queimador', ['fumageiro', 'equipamentos']),
  makeProduct('biomassa', ['equipamentos']),
]

function renderGrid() {
  return render(<SolutionsGrid filters={filters} solutions={solutions} />)
}

describe('SolutionsGrid', () => {
  it('filtra os cards renderizados e restaura todos', async () => {
    const user = userEvent.setup()
    renderGrid()
    expect(screen.getByRole('tablist', { name: 'Filtrar soluções' }).parentElement?.classList.contains('solution-tablist-wrap')).toBe(true)
    expect(screen.getAllByRole('article')).toHaveLength(3)

    await user.click(screen.getByRole('tab', { name: 'Fumageiro' }))
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('tab', { name: 'Fumageiro' }).getAttribute('aria-selected')).toBe('true')

    await user.click(screen.getByRole('tab', { name: 'Todos' }))
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('mostra o estado vazio em uma categoria sem cards', async () => {
    const user = userEvent.setup()
    renderGrid()
    await user.click(screen.getByRole('tab', { name: 'Aviário' }))

    expect(screen.getByText('Nenhuma solução desta categoria nesta apresentação.')).toBeTruthy()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })
})
