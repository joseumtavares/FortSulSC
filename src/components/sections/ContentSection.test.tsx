import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentSection } from './ContentSection'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

describe('ContentSection', () => {
  it('preserva o heading, os três cards e as imagens do baseline', () => {
    render(
      <WhatsAppProvider>
        <ContentSection />
      </WhatsAppProvider>,
    )

    expect(screen.getByRole('region').id).toBe('novidades-e-dicas')
    expect(screen.getByRole('heading', { level: 2, name: 'Novidades e dicas' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Como escolher o alimentador ideal' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Cuidados com queimadores industriais' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'FortSul em todo o Brasil' })).toBeTruthy()
    expect(screen.getByAltText('Alimentador de cavaco, briquete e pellets em opera\u00e7\u00e3o')).toBeTruthy()
    expect(screen.getByAltText('Queimador industrial FortSul')).toBeTruthy()
    expect(screen.getByAltText('Mapa de representantes da FortSul por estado')).toBeTruthy()
  })

  it('abre o diálogo de WhatsApp pelo CTA final', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <ContentSection />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Falar com a FortSul pelo WhatsApp' }))

    expect((screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement).open).toBe(true)
  })
})
