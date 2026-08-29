import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { solutionFilters } from './solutions-data'
import { SolutionFilters } from './SolutionFilters'

describe('SolutionFilters', () => {
  it('usa botões de filtro com aria-pressed, sem semântica de tabs', async () => {
    const onFilterChange = vi.fn()
    const user = userEvent.setup()
    render(<SolutionFilters filters={solutionFilters} activeFilter="todos" onFilterChange={onFilterChange} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual(['Todos', 'Aviário', 'Equipamentos', 'Fumageiro', 'Piscicultura', 'Secadores'])
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons.slice(1).every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true)
    expect(document.querySelector('[role="tablist"], [role="tab"], [aria-selected]')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Fumageiro' }))
    expect(onFilterChange).toHaveBeenCalledWith('fumageiro')
  })
})
