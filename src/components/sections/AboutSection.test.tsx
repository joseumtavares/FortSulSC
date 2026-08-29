import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutSection } from './AboutSection'

describe('AboutSection', () => {
  it('preserva a seção Sobre, diferenciais e CTA do baseline', () => {
    render(<AboutSection />)

    expect(screen.getByRole('region').id).toBe('empresa')
    expect(screen.getByRole('heading', { level: 2, name: /tecnologia robusta/i })).toBeTruthy()
    expect(screen.getByText('Produção própria')).toBeTruthy()
    expect(screen.getByText('Solução completa')).toBeTruthy()
    expect(screen.getByRole('link', { name: /conheça nosso jeito/i }).getAttribute('href')).toBe('#atendimento')
    expect(screen.getByAltText('Alimentador FortSul em destaque')).toBeTruthy()
  })
})
