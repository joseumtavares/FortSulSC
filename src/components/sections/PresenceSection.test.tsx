import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresenceSection } from './PresenceSection'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })))
})

describe('PresenceSection', () => {
  it('preserva o conteúdo e o mapa estático do baseline', () => {
    render(<PresenceSection />)

    expect(screen.getByRole('region').id).toBe('presenca')
    expect(screen.getByRole('heading', { level: 2, name: /representantes em diferentes regiões/i })).toBeTruthy()
    expect(screen.getByText(/encontre atendimento comercial próximo/i)).toBeTruthy()
    expect(screen.getByAltText('Mapa de atuação dos representantes FortSul')).toBeTruthy()
  })

  it('abre o painel de mapa ao clicar em "Encontrar representante"', async () => {
    const user = userEvent.setup()
    render(<PresenceSection />)

    await user.click(screen.getByRole('button', { name: 'Encontrar representante' }))

    expect(screen.getByRole('dialog', { name: 'Encontre um representante' })).toBeTruthy()
  })

  it('abre o painel de mapa ao clicar na imagem do mapa estático', async () => {
    const user = userEvent.setup()
    render(<PresenceSection />)

    await user.click(screen.getByRole('button', { name: 'Abrir mapa interativo de representantes' }))

    expect(screen.getByRole('dialog', { name: 'Encontre um representante' })).toBeTruthy()
  })
})
