import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentSectionView } from './ContentSectionView'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'
import type { ContentCardData } from '@/components/content/content-data'

const items: ContentCardData[] = [
  {
    id: 'artigo-1',
    image: { src: '/image/alimentador-reto-banner1.webp', alt: 'Alimentador de cavaco, briquete e pellets em operação' },
    title: 'Como escolher o alimentador ideal',
    description: 'Dicas para dimensionar o alimentador certo para o seu processo.',
    body: 'Texto completo do artigo sobre alimentadores.',
    gallery: [{ src: '/image/alimentador-reto.webp', alt: 'Alimentador reto FortSul' }],
  },
  {
    id: 'artigo-2',
    image: { src: '/image/queimador.webp', alt: 'Queimador industrial FortSul' },
    title: 'Cuidados com queimadores industriais',
    description: 'Boas práticas de manutenção para prolongar a vida útil do equipamento.',
    body: 'Texto completo do artigo sobre queimadores.',
    gallery: [],
  },
  {
    id: 'artigo-3',
    image: { src: '/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png', alt: 'Mapa de representantes da FortSul por estado' },
    title: 'FortSul em todo o Brasil',
    description: 'Conheça a rede de representantes da FortSul nos estados ativos.',
    body: 'Texto completo do artigo sobre a rede de representantes.',
    gallery: [
      { src: '/image/grade-aradora-vermelha.webp', alt: 'Grade aradora FortSul' },
      { src: '/image/secador-estatico.webp', alt: 'Secador estático FortSul' },
    ],
  },
]

function getOpenDialog(): HTMLDialogElement {
  const dialogs = screen.getAllByRole('dialog', { hidden: true }) as HTMLDialogElement[]
  const open = dialogs.find((dialog) => dialog.open)
  if (!open) throw new Error('Nenhum diálogo aberto encontrado.')
  return open
}

describe('ContentSectionView', () => {
  it('preserva o heading e os cards recebidos', () => {
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    expect(screen.getByRole('region').id).toBe('novidades-e-dicas')
    expect(screen.getByRole('heading', { level: 2, name: 'Novidades e dicas' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Como escolher o alimentador ideal' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Cuidados com queimadores industriais' })).toBeTruthy()
    expect(screen.getByAltText('Alimentador de cavaco, briquete e pellets em operação')).toBeTruthy()
  })

  it('renderiza um card por artigo, sem duplicação, com setas de navegação', () => {
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    expect(document.querySelectorAll('.content-card-body h3').length).toBe(items.length)
    expect(document.querySelectorAll('.content-card-trigger').length).toBe(items.length)
    expect(screen.getByRole('button', { name: 'Ver artigos anteriores' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ver próximos artigos' })).toBeTruthy()
  })

  it('não mostra setas de navegação quando há só um artigo', () => {
    render(
      <WhatsAppProvider>
        <ContentSectionView items={[items[0]]} />
      </WhatsAppProvider>,
    )

    expect(screen.queryByRole('button', { name: 'Ver artigos anteriores' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ver próximos artigos' })).toBeNull()
  })

  it('rola o carrossel ao clicar na seta de próximo', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    const track = document.querySelector('.content-track') as HTMLElement
    const scrollBySpy = vi.fn()
    track.scrollBy = scrollBySpy

    await user.click(screen.getByRole('button', { name: 'Ver próximos artigos' }))

    expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }))
  })

  it('mostra estado vazio quando não há artigos publicados', () => {
    render(
      <WhatsAppProvider>
        <ContentSectionView items={[]} />
      </WhatsAppProvider>,
    )

    expect(screen.getByText('Em breve, novidades e dicas por aqui.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Como escolher/ })).toBeNull()
  })

  it('abre o popup do artigo com texto e galeria ao clicar no card', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    await user.click(screen.getAllByRole('button', { name: /Como escolher o alimentador ideal/ })[0])

    const dialog = getOpenDialog()
    expect(dialog.open).toBe(true)
    expect(within(dialog).getByText('Texto completo do artigo sobre alimentadores.')).toBeTruthy()
    expect(within(dialog).getByAltText('Alimentador reto FortSul')).toBeTruthy()
  })

  it('navega manualmente entre as imagens da galeria do popup', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    await user.click(screen.getAllByRole('button', { name: /FortSul em todo o Brasil/ })[0])

    const dialog = getOpenDialog()
    expect(within(dialog).getByAltText('Grade aradora FortSul')).toBeTruthy()

    await user.click(within(dialog).getByRole('button', { name: 'Próxima imagem' }))

    expect(within(dialog).getByAltText('Secador estático FortSul')).toBeTruthy()
  })

  it('abre o diálogo de WhatsApp pelo CTA final', async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppProvider>
        <ContentSectionView items={items} />
      </WhatsAppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Falar com a FortSul pelo WhatsApp' }))

    const dialogs = screen.getAllByRole('dialog', { hidden: true }) as HTMLDialogElement[]
    expect(dialogs.some((dialog) => dialog.open)).toBe(true)
  })
})
