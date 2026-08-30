import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CtaSection } from './CtaSection'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('CtaSection', () => {
  it('preserva o CTA final do baseline como uma região nomeada', () => {
    render(
      <WhatsAppProvider>
        <CtaSection />
      </WhatsAppProvider>,
    )

    const section = screen.getByRole('region', { name: 'O próximo ganho de eficiência pode começar aqui.' })

    expect(section.id).toBe('contato')
    expect(within(section).getByText('Vamos conversar?')).toBeTruthy()
  })

  it('abre o diálogo de WhatsApp pelo CTA', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <CtaSection />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Falar com a FortSul pelo WhatsApp' }))

    expect((screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement).open).toBe(true)
  })
})
