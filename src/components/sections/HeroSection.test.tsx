import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection', () => {
  it('preserva o conteúdo, a semântica e os CTAs do baseline', () => {
    render(<HeroSection />)

    expect(screen.getByRole('region', { name: /mais eficiência/i })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).id).toBe('hero-title')
    expect(screen.getByRole('link', { name: /conheça as soluções/i }).getAttribute('href')).toBe('#solucoes')
    expect(screen.getByRole('link', { name: /por que escolher a fortsul/i }).getAttribute('href')).toBe('#empresa')
    expect(screen.getByText('Do projeto ao pós-venda')).toBeTruthy()
    expect(screen.getByAltText('')).toBeTruthy()
  })
})
