import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutSection } from './AboutSection'

describe('AboutSection', () => {
  it('mantém a âncora da seção e inicia o fichário pela aba FortSul', () => {
    render(<AboutSection />)

    expect(screen.getByRole('region').id).toBe('empresa')
    expect(screen.getByRole('tablist', { name: 'Seções sobre a FortSul' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'FortSul' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'FortSul' }).hidden).toBe(false)
  })
})
