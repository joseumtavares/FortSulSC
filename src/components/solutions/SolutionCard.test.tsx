import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { solutions } from './solutions-data'
import { SolutionCard } from './SolutionCard'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('SolutionCard', () => {
  it('preserva o link real do produto destacado', () => {
    render(<WhatsAppProvider><SolutionCard solution={solutions[0]} /></WhatsAppProvider>)
    expect(screen.getByRole('article').classList.contains('featured')).toBe(true)
    expect(screen.getByRole('link', { name: /ver detalhes do alimentador/i }).getAttribute('href')).toBe('produto-alimentador.html')
    expect(screen.getByText('Lançamento')).toBeTruthy()
  })

  it('usa gatilho WhatsApp para um card não destacado e preserva imagens split', () => {
    render(<WhatsAppProvider><SolutionCard solution={solutions[2]} /></WhatsAppProvider>)
    expect(screen.getByRole('button', { name: /solicitar informações sobre soluções/i }).getAttribute('aria-haspopup')).toBe('dialog')
    expect(screen.getByAltText('Cavaco de madeira').getAttribute('width')).toBe('640')
    expect(screen.getByAltText('Pellets de madeira').getAttribute('height')).toBe('640')
  })
})
