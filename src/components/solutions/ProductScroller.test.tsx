import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'
import { ProductScroller } from './ProductScroller'
import { solutions } from './solutions-data'

function renderScroller(products = solutions) {
  return render(<WhatsAppProvider><ProductScroller products={products} activeFilter="todos" /></WhatsAppProvider>)
}

describe('ProductScroller', () => {
  it('mostra o estado vazio sem criar painel de scroll', () => {
    renderScroller([])
    expect(screen.getByText('Nenhuma solução desta categoria nesta apresentação.')).toBeTruthy()
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('renderiza um carrossel horizontal com um card por produto', () => {
    renderScroller()
    expect(screen.getByRole('tabpanel', { name: 'Soluções' }).id).toBe('solution-panel')
    expect(screen.getAllByRole('article')).toHaveLength(solutions.length)
    expect(document.querySelector('.solution-carousel-track')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ver próximos produtos' })).toBeTruthy()
  })
})
