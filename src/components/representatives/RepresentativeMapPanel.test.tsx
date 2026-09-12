import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepresentativeMapPanel } from './RepresentativeMapPanel'

const partners = [
  {
    id: 'p1',
    type: 'REPRESENTATIVE' as const,
    name: 'Fulano de Tal',
    description: 'Atende a região sul.',
    whatsapp: '5548999990000',
    websiteUrl: null,
    logoUrl: null,
    approximateLat: -27.6,
    approximateLng: -48.55,
    socialLinks: null,
    municipalities: ['Orleans', 'Tubarão'],
  },
  {
    id: 'p2',
    type: 'RESELLER' as const,
    name: 'Revenda Modelo',
    description: null,
    whatsapp: '5541988880000',
    websiteUrl: null,
    logoUrl: null,
    approximateLat: -25.4,
    approximateLng: -49.2,
    socialLinks: null,
    municipalities: ['Curitiba'],
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(partners), { status: 200 })))
})

describe('RepresentativeMapPanel', () => {
  it('does not fetch when closed', () => {
    render(<RepresentativeMapPanel open={false} onClose={vi.fn()} />)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches partners and lists them when opened', async () => {
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    expect(await screen.findByText('Fulano de Tal')).toBeTruthy()
    expect(screen.getByText('Revenda Modelo')).toBeTruthy()
  })

  it('filters results by city name', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await screen.findByText('Fulano de Tal')

    await user.type(screen.getByLabelText('Buscar por cidade ou representante'), 'curitiba')

    expect(screen.getByText('Revenda Modelo')).toBeTruthy()
    expect(screen.queryByText('Fulano de Tal')).toBeNull()
  })

  it('suggests real Região Sul municipality names while typing', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await screen.findByText('Fulano de Tal')

    await user.type(screen.getByLabelText('Buscar por cidade ou representante'), 'orlea')

    expect(await screen.findByRole('option', { name: /Orleans/ })).toBeTruthy()
  })

  it('fills the search box when a city suggestion is selected', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await screen.findByText('Fulano de Tal')

    const input = screen.getByLabelText('Buscar por cidade ou representante') as HTMLInputElement
    await user.type(input, 'orlea')
    await user.click(await screen.findByRole('button', { name: /Orleans/ }))

    expect(input.value).toBe('Orleans')
  })

  it('shows the representative card with a WhatsApp link when a result is selected', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /Fulano de Tal/ }))

    expect(screen.getByText('Atende: Orleans, Tubarão')).toBeTruthy()
    const whatsappLink = screen.getByRole('link', { name: 'Falar no WhatsApp' }) as HTMLAnchorElement
    expect(whatsappLink.href).toContain('wa.me/5548999990000')
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RepresentativeMapPanel open onClose={onClose} />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    await user.click(screen.getByLabelText('Fechar mapa de representantes'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when "Voltar ao site" is clicked (redundant close affordance for mobile)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RepresentativeMapPanel open onClose={onClose} />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /Voltar ao site/ }))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RepresentativeMapPanel open onClose={onClose} />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('offers the FortSul WhatsApp contact, with the search term in the message, when a search finds nothing', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await screen.findByText('Fulano de Tal')

    await user.type(screen.getByLabelText('Buscar por cidade ou representante'), 'Blumenau')

    expect(screen.getByText('Ainda não temos representante em “Blumenau”')).toBeTruthy()
    const whatsappLink = screen.getByRole('link', { name: 'Falar no WhatsApp' }) as HTMLAnchorElement
    expect(whatsappLink.href).not.toContain('5548999990000')
    const message = decodeURIComponent(new URL(whatsappLink.href).searchParams.get('text') ?? '')
    expect(message).toContain('Blumenau')
  })

  it('shows a plain empty state (no WhatsApp fallback) when there is no active search', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    expect(await screen.findByText('Nenhum representante encontrado.')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Falar no WhatsApp' })).toBeNull()
  })

  it('shows an empty state when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('error', { status: 500 }))
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    expect(await screen.findByText('Não foi possível carregar os representantes agora.')).toBeTruthy()
  })

  it('locks page scroll while open and releases it on close', async () => {
    const { unmount } = render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await waitFor(() => expect(document.body.classList.contains('dialog-open')).toBe(true))
    unmount()
    expect(document.body.classList.contains('dialog-open')).toBe(false)
  })

  it('traps Tab focus within the panel, wrapping from the last to the first focusable element', async () => {
    const user = userEvent.setup()
    render(<RepresentativeMapPanel open onClose={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /Fulano de Tal/ }))

    const whatsappLink = screen.getByRole('link', { name: 'Falar no WhatsApp' })
    whatsappLink.focus()
    await user.tab()

    expect(document.activeElement).toBe(screen.getByLabelText('Fechar'))
  })
})
