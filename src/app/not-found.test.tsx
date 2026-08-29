import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('NotFound', () => {
  it('oferece uma página de erro e um caminho de volta à home', () => {
    render(<WhatsAppProvider><NotFound /></WhatsAppProvider>)

    expect(screen.getByText('Página não encontrada')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: /esta página não está disponível/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /voltar para o início/i })).toHaveProperty('href', 'http://localhost:3000/')
  })
})
