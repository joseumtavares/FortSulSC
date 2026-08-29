import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupportStep } from './SupportStep'
import { supportSteps } from './support-data'

describe('SupportStep', () => {
  it('renderiza número, título, descrição e ícone da etapa', () => {
    render(<SupportStep step={supportSteps[0]} />)

    expect(screen.getByText('01')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Entendimento' })).toBeTruthy()
    expect(screen.getByText('Conhecemos a necessidade e o contexto da sua produção.')).toBeTruthy()
    expect(document.querySelector('svg path')?.getAttribute('d')).toBe(supportSteps[0].icon)
  })

  it('aplica reveal-delay quando delay é true', () => {
    render(<SupportStep step={supportSteps[1]} delay />)

    expect(screen.getByRole('article').classList.contains('reveal-delay')).toBe(true)
  })
})
