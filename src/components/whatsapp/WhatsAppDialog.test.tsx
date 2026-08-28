import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhatsAppDialog } from './WhatsAppDialog'

function renderOpen(onClose: () => void) {
  const { rerender } = render(<WhatsAppDialog open={false} onClose={onClose} />)
  rerender(<WhatsAppDialog open={true} onClose={onClose} />)
}

describe('WhatsAppDialog', () => {
  it('não fica aberto quando open=false', () => {
    render(<WhatsAppDialog open={false} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
    expect(dialog.open).toBe(false)
  })

  it('abre e foca o botão de fechar quando open=true', () => {
    renderOpen(() => {})

    const dialog = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
    expect(dialog.open).toBe(true)

    const closeButton = screen.getByRole('button', { name: 'Fechar opções de contato' })
    expect(document.activeElement).toBe(closeButton)
  })

  it('fecha ao clicar no botão de fechar e chama onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderOpen(onClose)

    await user.click(screen.getByRole('button', { name: 'Fechar opções de contato' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('fecha ao pressionar Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderOpen(onClose)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('fecha ao clicar no overlay (fora do conteúdo)', () => {
    const onClose = vi.fn()
    renderOpen(onClose)

    fireEvent.click(screen.getByRole('dialog', { hidden: true }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('não fecha ao clicar dentro do conteúdo do diálogo', () => {
    const onClose = vi.fn()
    renderOpen(onClose)

    fireEvent.click(screen.getByText('Vamos conversar?'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('Tab no último elemento focável volta o foco para o primeiro (wrap)', async () => {
    const user = userEvent.setup()
    renderOpen(() => {})

    const closeButton = screen.getByRole('button', { name: 'Fechar opções de contato' })
    const chatLink = screen.getByRole('link', { name: /Abrir conversa no WhatsApp/ })

    chatLink.focus()
    await user.tab()

    expect(document.activeElement).toBe(closeButton)
  })

  it('Shift+Tab no primeiro elemento focável vai para o último (wrap)', async () => {
    const user = userEvent.setup()
    renderOpen(() => {})

    const chatLink = screen.getByRole('link', { name: /Abrir conversa no WhatsApp/ })

    // após abrir, o foco já está no botão de fechar (primeiro elemento focável)
    await user.tab({ shift: true })

    expect(document.activeElement).toBe(chatLink)
  })
})
