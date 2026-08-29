import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupportSection } from './SupportSection'

describe('SupportSection', () => {
  it('renderiza o cabeçalho e as etapas na ordem do baseline', () => {
    render(<SupportSection />)

    expect(screen.getByRole('region').id).toBe('atendimento')
    expect(screen.getByRole('heading', { level: 2, name: /a parceria continua/i })).toBeTruthy()

    const steps = screen.getAllByRole('article')
    expect(steps.map((step) => step.querySelector('h3')?.textContent)).toEqual([
      'Entendimento',
      'Instalação',
      'Suporte',
      'Pós-venda',
    ])
    expect(steps.map((step) => step.querySelector('span')?.textContent)).toEqual(['01', '02', '03', '04'])
  })

  it('aplica reveal-delay apenas nas etapas 02 e 04', () => {
    render(<SupportSection />)
    const steps = screen.getAllByRole('article')

    expect(steps.map((step) => step.classList.contains('reveal-delay'))).toEqual([false, true, false, true])
  })
})
