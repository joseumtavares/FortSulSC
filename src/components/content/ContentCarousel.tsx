'use client'

import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ContentCard } from './ContentCard'
import { ContentArticleDialog } from './ContentArticleDialog'
import type { ContentCardData } from './content-data'

export function ContentCarousel({ items }: { items: ContentCardData[] }) {
  const [activeItem, setActiveItem] = useState<ContentCardData | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLUListElement>(null)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: (direction === 'left' ? -1 : 1) * track.clientWidth * 0.8,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <>
      <div className="content-carousel">
        {items.length > 1 && (
          <button
            type="button"
            className="content-carousel-control is-previous"
            aria-label="Ver artigos anteriores"
            onClick={() => scroll('left')}
          >
            <Chevron direction="left" />
          </button>
        )}
        <ul ref={trackRef} className="content-track" aria-label="Novidades e dicas">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} onSelect={() => setActiveItem(item)} />
          ))}
        </ul>
        {items.length > 1 && (
          <button
            type="button"
            className="content-carousel-control is-next"
            aria-label="Ver próximos artigos"
            onClick={() => scroll('right')}
          >
            <Chevron direction="right" />
          </button>
        )}
      </div>

      <ContentArticleDialog item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}
