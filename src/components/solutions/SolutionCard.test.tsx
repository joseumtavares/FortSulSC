import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SolutionCard } from './SolutionCard'
import type { SolutionCardData } from './solutions-data'

const solution: SolutionCardData = {
  id: 'produto-1',
  code: 'ALM-001',
  name: 'Alimentador de Cavaco',
  eyebrow: 'Lançamento',
  shortDescription: 'Alimenta fornalhas com cavaco, briquete e pellets.',
  description: null,
  catalogUrl: null,
  categorySlugs: ['equipamentos', 'fumageiro'],
  applications: [],
  specifications: [],
  heroImage: { src: '/image/alimentador.webp', alt: 'Alimentador de cavaco, briquete e pellets em operação' },
  gallery: [],
  testimonials: [],
  whatsappLink: 'https://wa.me/554836600818?text=teste',
}

describe('SolutionCard', () => {
  it('mostra eyebrow, nome e imagem de destaque', () => {
    render(<SolutionCard solution={solution} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Alimentador de Cavaco' })).toBeTruthy()
    expect(screen.getByText('Lançamento')).toBeTruthy()
    expect(screen.getByAltText('Alimentador de cavaco, briquete e pellets em operação')).toBeTruthy()
  })

  it('abre o popup do produto ao clicar', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SolutionCard solution={solution} onSelect={onSelect} />)

    const trigger = screen.getByRole('button', { name: /Alimentador de Cavaco/ })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')

    await user.click(trigger)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
