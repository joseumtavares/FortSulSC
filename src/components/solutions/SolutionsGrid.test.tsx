import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { solutions, solutionFilters } from './solutions-data'
import { SolutionsGrid } from './SolutionsGrid'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

function renderGrid() {
  return render(<WhatsAppProvider><SolutionsGrid filters={solutionFilters} solutions={solutions} /></WhatsAppProvider>)
}

describe('SolutionsGrid', () => {
  it('filtra sem remover cards do DOM e restaura todos', async () => {
    const user = userEvent.setup()
    renderGrid()
    const filters = screen.getByLabelText('Filtrar soluções')
    expect(filters.classList.contains('solution-filters')).toBe(true)
    expect(filters.classList.contains('reveal')).toBe(true)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    expect(cards.every((card) => !card.classList.contains('is-hidden'))).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Fumageiro' }))
    expect(cards.map((card) => card.getAttribute('data-category'))).toEqual(['equipamentos fumageiro', 'fumageiro equipamentos', 'equipamentos'])
    expect(cards[2].classList.contains('is-hidden')).toBe(true)
    expect(screen.getByRole('button', { name: 'Fumageiro' }).getAttribute('aria-pressed')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(cards.every((card) => !card.classList.contains('is-hidden'))).toBe(true)
  })

  it('mostra o estado vazio em uma categoria sem cards', async () => {
    const user = userEvent.setup()
    renderGrid()
    await user.click(screen.getByRole('button', { name: 'Aviário' }))

    expect(screen.getByText('Nenhuma solução desta categoria nesta apresentação.').hidden).toBe(false)
    expect(screen.getAllByRole('article').every((card) => card.classList.contains('is-hidden'))).toBe(true)
  })
})
