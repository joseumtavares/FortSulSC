import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BannerStripView, type BannerStripItem } from './BannerStripView'

const items: BannerStripItem[] = [
  { id: 'banner-1', imageUrl: '/image/banner1.webp', altText: 'Promoção de equipamentos FortSul', linkUrl: 'https://fortsulsc.com.br/promo' },
  { id: 'banner-2', imageUrl: '/image/banner2.webp', altText: 'Novos produtos FortSul', linkUrl: null },
]

describe('BannerStripView', () => {
  it('não renderiza nada quando não há banner ativo', () => {
    const { container } = render(<BannerStripView items={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renderiza um item por banner, sem setas quando há só um', () => {
    render(<BannerStripView items={[items[0]]} />)

    expect(screen.getByAltText('Promoção de equipamentos FortSul')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Ver banner anterior' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ver próximo banner' })).toBeNull()
  })

  it('mostra setas de navegação quando há mais de um banner ativo', async () => {
    const user = userEvent.setup()
    render(<BannerStripView items={items} />)

    const track = document.querySelector('.banner-track') as HTMLElement
    const scrollBySpy = vi.fn()
    track.scrollBy = scrollBySpy

    await user.click(screen.getByRole('button', { name: 'Ver próximo banner' }))

    expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }))
  })

  it('envolve em link só quando o banner tem linkUrl', () => {
    render(<BannerStripView items={items} />)

    const withLink = screen.getByAltText('Promoção de equipamentos FortSul').closest('a')
    expect(withLink?.getAttribute('href')).toBe('https://fortsulsc.com.br/promo')
    expect(withLink?.getAttribute('target')).toBe('_blank')
    expect(withLink?.getAttribute('rel')).toBe('noopener noreferrer')

    const withoutLink = screen.getByAltText('Novos produtos FortSul').closest('a')
    expect(withoutLink).toBeNull()
  })
})
