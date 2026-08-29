import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresenceSection } from './PresenceSection'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('PresenceSection', () => {
  it('preserva o conteúdo e o mapa estático do baseline', () => {
    render(
      <WhatsAppProvider>
        <PresenceSection />
      </WhatsAppProvider>,
    )

    expect(screen.getByRole('region').id).toBe('presenca')
    expect(screen.getByRole('heading', { level: 2, name: /representantes em diferentes regiões/i })).toBeTruthy()
    expect(screen.getByText(/encontre atendimento comercial próximo/i)).toBeTruthy()
    expect(screen.getByAltText('Mapa de atuação dos representantes FortSul')).toBeTruthy()
  })

  it('abre o diálogo de WhatsApp ao buscar um representante', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <PresenceSection />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Encontrar representante via WhatsApp' }))

    expect((screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement).open).toBe(true)
  })
})
