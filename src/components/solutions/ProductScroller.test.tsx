import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductScroller } from './ProductScroller'
import type { SolutionCardData } from './solutions-data'

const products: SolutionCardData[] = [
  {
    id: 'produto-1', code: 'ALM-001', name: 'Alimentador de Cavaco', eyebrow: null, shortDescription: null, description: 'Descrição completa do alimentador.',
    catalogUrl: null, categorySlugs: ['equipamentos', 'fumageiro'], applications: ['Fornalhas industriais'], specifications: [{ label: 'Potência', value: '5 HP' }],
    heroImage: { src: '/image/alimentador.webp', alt: 'Alimentador' }, gallery: [], testimonials: [], whatsappLink: 'https://wa.me/554836600818?text=1',
  },
  {
    id: 'produto-2', code: 'QUE-001', name: 'Queimador', eyebrow: null, shortDescription: null, description: null,
    catalogUrl: null, categorySlugs: ['fumageiro'], applications: [], specifications: [],
    heroImage: null, gallery: [], testimonials: [], whatsappLink: 'https://wa.me/554836600818?text=2',
  },
]

function renderScroller(items = products) {
  return render(<ProductScroller products={items} activeFilter="todos" />)
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
    expect(screen.getAllByRole('article')).toHaveLength(products.length)
    expect(document.querySelector('.solution-carousel-track')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ver próximos produtos' })).toBeTruthy()
  })

  it('abre o popup do produto ao clicar em um card', async () => {
    const user = userEvent.setup()
    renderScroller()

    await user.click(screen.getByRole('button', { name: /Alimentador de Cavaco/ }))

    const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
    expect(dialog.open).toBe(true)
    expect(screen.getByText('Descrição completa do alimentador.')).toBeTruthy()
    expect(screen.getByText('Fornalhas industriais')).toBeTruthy()
    expect(screen.getByText('Potência')).toBeTruthy()
    expect(screen.getByText('5 HP')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Saiba mais' }).getAttribute('href')).toBe('https://wa.me/554836600818?text=1')
  })

  it('mostra depoimentos quando o produto tem', async () => {
    const user = userEvent.setup()
    const withTestimonial: SolutionCardData[] = [
      { ...products[0], testimonials: [{ platform: 'TIKTOK', url: 'https://tiktok.com/@x/video/1', authorName: 'Parceiro X' }] },
    ]
    renderScroller(withTestimonial)

    await user.click(screen.getByRole('button', { name: /Alimentador de Cavaco/ }))

    expect(screen.getByRole('link', { name: 'TikTok — Parceiro X' }).getAttribute('href')).toBe('https://tiktok.com/@x/video/1')
  })
})
