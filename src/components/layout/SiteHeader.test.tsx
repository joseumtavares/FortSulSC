import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  it('renderiza a navegação, marca e CTA de orçamento', () => {
    render(
      <WhatsAppProvider>
        <SiteHeader />
      </WhatsAppProvider>,
    )

    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'FortSul — início' }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Solicitar orçamento por WhatsApp' })).toBeTruthy()
  })

  it('não deixa o telefone da barra superior clicável (evita tentativa de discagem no desktop)', () => {
    render(
      <WhatsAppProvider>
        <SiteHeader />
      </WhatsAppProvider>,
    )

    const header = screen.getByRole('banner')
    expect(within(header).getByText('(48) 3660-0818').tagName).toBe('SPAN')
    expect(within(header).queryByRole('link', { name: '(48) 3660-0818' })).toBeNull()
  })

  it('abre o diálogo de WhatsApp pelo CTA', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <SiteHeader />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Solicitar orçamento por WhatsApp' }))

    expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', true)
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Fechar opções de contato' }),
    )
  })
})
