import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardStatCards } from './DashboardStatCards'

describe('DashboardStatCards', () => {
  it('renders a card with the count for each tracked entity', () => {
    render(
      <DashboardStatCards
        counts={{ products: 12, categories: 4, representatives: 7, resellers: 3, banners: 2, articles: 9 }}
      />,
    )

    expect(screen.getByText('Produtos').nextElementSibling?.textContent).toBe('12')
    expect(screen.getByText('Categorias').nextElementSibling?.textContent).toBe('4')
    expect(screen.getByText('Representantes').nextElementSibling?.textContent).toBe('7')
    expect(screen.getByText('Revendas').nextElementSibling?.textContent).toBe('3')
    expect(screen.getByText('Banners').nextElementSibling?.textContent).toBe('2')
    expect(screen.getByText('Novidades e dicas').nextElementSibling?.textContent).toBe('9')
  })
})
