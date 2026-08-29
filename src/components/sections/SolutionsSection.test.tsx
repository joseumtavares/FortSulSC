import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SolutionsSection } from './SolutionsSection'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('SolutionsSection', () => {
  it('renderiza o cabeçalho e os filtros aprovados', () => {
    render(<WhatsAppProvider><SolutionsSection /></WhatsAppProvider>)
    expect(screen.getByRole('region').id).toBe('solucoes')
    expect(screen.getByText('Nossas soluções')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: /equipamentos pensados/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Equipamentos' })).toBeTruthy()
  })
})
