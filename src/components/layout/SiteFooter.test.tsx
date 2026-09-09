import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('preserva os quatro blocos do rodapé e o copyright aprovado', () => {
    render(
      <WhatsAppProvider>
        <SiteFooter />
      </WhatsAppProvider>,
    )

    expect(screen.getByRole('contentinfo').textContent).toContain(
      '© 2026 FortSulSC. Todos os direitos reservados.',
    )
    expect(screen.getByRole('link', { name: 'Instagram ↗' }).getAttribute('href')).toBe(
      'https://www.instagram.com/fortsulsc.ols/',
    )
    expect(screen.getByRole('link', { name: 'Voltar ao topo ↑' }).getAttribute('href')).toBe('#inicio')
  })

  it('expõe um link discreto para o login administrativo no símbolo de copyright', () => {
    render(
      <WhatsAppProvider>
        <SiteFooter />
      </WhatsAppProvider>,
    )

    const link = screen.getByRole('link', { name: 'Acesso administrativo' })
    expect(link.getAttribute('href')).toBe('/admin/login')
    expect(link.textContent).toBe('©')
  })

  it('abre o diálogo pelo CTA de WhatsApp', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <SiteFooter />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Atendimento via WhatsApp' }))

    expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', true)
  })
})
