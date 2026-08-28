import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhatsAppProvider } from './WhatsAppProvider'
import { WhatsAppTrigger } from './WhatsAppTrigger'

describe('fluxo WhatsApp (Provider + Trigger + Dialog)', () => {
  it('abre o diálogo ao clicar no gatilho e devolve o foco ao gatilho de origem ao fechar', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <WhatsAppTrigger ariaLabel="Falar no WhatsApp">Falar no WhatsApp</WhatsAppTrigger>
      </WhatsAppProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Falar no WhatsApp' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
    expect(dialog.open).toBe(true)

    const closeButton = screen.getByRole('button', { name: 'Fechar opções de contato' })
    expect(document.activeElement).toBe(closeButton)

    await user.click(closeButton)

    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
})
