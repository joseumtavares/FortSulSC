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
