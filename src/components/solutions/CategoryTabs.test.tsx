import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryTabs } from './CategoryTabs'
import { solutionFilters } from './solutions-data'

describe('CategoryTabs', () => {
  it('expõe tabs acessíveis e seleciona a categoria ativa', () => {
    render(<CategoryTabs filters={solutionFilters} activeFilter="todos" onFilterChange={vi.fn()} />)

    expect(screen.getByRole('tablist', { name: 'Filtrar soluções' })).toBeTruthy()
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Todos', 'Aviário', 'Equipamentos', 'Fumageiro', 'Piscicultura', 'Secadores',
    ])
    expect(screen.getByRole('tab', { name: 'Todos' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Todos' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: 'Aviário' }).getAttribute('tabindex')).toBe('-1')
  })

  it('solicita a troca ao clicar em uma categoria', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(<CategoryTabs filters={solutionFilters} activeFilter="todos" onFilterChange={onFilterChange} />)

    await user.click(screen.getByRole('tab', { name: 'Fumageiro' }))
    expect(onFilterChange).toHaveBeenCalledWith('fumageiro')
  })

  it('navega com setas, Home e End como as tabs institucionais', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(<CategoryTabs filters={solutionFilters} activeFilter="todos" onFilterChange={onFilterChange} />)

    const todos = screen.getByRole('tab', { name: 'Todos' })
    todos.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Aviário' }))
    expect(onFilterChange).toHaveBeenLastCalledWith('aviario')

    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Secadores' }))
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(todos)
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Secadores' }))
  })
})
