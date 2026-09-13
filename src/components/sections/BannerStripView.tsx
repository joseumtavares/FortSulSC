'use client'

import { useRef } from 'react'
import { useReducedMotion } from 'motion/react'

export type BannerStripItem = { id: string; imageUrl: string; altText: string; linkUrl: string | null }

function BannerImage({ item }: { item: BannerStripItem }) {
  // Imagem vem de storage externo (local:// em dev, R2/Supabase em produção) —
  // next/image exige domínio conhecido em remotePatterns, então usa <img>
  // puro, mesmo padrão já usado em ContentCard/ArticleCoverUploadForm.
  const image = <img src={item.imageUrl} alt={item.altText} width={1600} height={400} loading="lazy" />

  if (!item.linkUrl) return image

  return (
    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={item.altText}>
      {image}
    </a>
  )
}

export function BannerStripView({ items }: { items: BannerStripItem[] }) {
  const shouldReduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLUListElement>(null)

  if (items.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: (direction === 'left' ? -1 : 1) * track.clientWidth * 0.8,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="banner-strip">
      <div className="container banner-carousel">
        {items.length > 1 && (
          <button type="button" className="banner-carousel-control is-previous" aria-label="Ver banner anterior" onClick={() => scroll('left')}>
            <Chevron direction="left" />
          </button>
        )}
        <ul ref={trackRef} className="banner-track" aria-label="Destaques FortSul">
          {items.map((item) => (
            <li key={item.id} className="banner-item">
              <BannerImage item={item} />
            </li>
          ))}
        </ul>
        {items.length > 1 && (
          <button type="button" className="banner-carousel-control is-next" aria-label="Ver próximo banner" onClick={() => scroll('right')}>
            <Chevron direction="right" />
          </button>
        )}
      </div>
    </div>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}
