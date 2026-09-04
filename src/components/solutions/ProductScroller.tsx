'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { SolutionCard } from './SolutionCard'
import type { Solution, SolutionFilterId } from './solutions-data'

type ProductScrollerProps = {
  products: Solution[]
  activeFilter: SolutionFilterId
}

export function ProductScroller({ products, activeFilter }: ProductScrollerProps) {
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const previousFilterRef = useRef<SolutionFilterId | null>(null)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: (direction === 'left' ? -1 : 1) * track.clientWidth * .8,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    })
  }

  useEffect(() => {
    if (previousFilterRef.current === null) {
      previousFilterRef.current = activeFilter
      return
    }
    if (previousFilterRef.current === activeFilter) return
    previousFilterRef.current = activeFilter

    try {
      trackRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    } catch {
      // jsdom does not implement scrolling; browsers reset the carousel above.
    }

    const section = sectionRef.current
    if (!section) return

    const headerOffset = document.querySelector('.nav-wrap.is-sticky')?.getBoundingClientRect().height ?? 0
    const top = section.getBoundingClientRect().top + window.scrollY - headerOffset
    try {
      window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' })
    } catch {
      // jsdom does not implement scrolling; browsers execute the reset above.
    }
  }, [activeFilter, shouldReduceMotion])

  if (products.length === 0) {
    return <p className="filter-empty">Nenhuma solução desta categoria nesta apresentação.</p>
  }

  return (
    <div ref={sectionRef} id="solution-panel" role="tabpanel" aria-label="Soluções" className="solution-carousel">
      {products.length > 1 && <button type="button" className="solution-carousel-control is-previous" aria-label="Ver produtos anteriores" onClick={() => scroll('left')}><Chevron direction="left" /></button>}
      <div ref={trackRef} className="solution-carousel-track">
        {products.map((solution) => (
          <div key={solution.id} className="solution-carousel-item"><SolutionCard solution={solution} /></div>
        ))}
      </div>
      {products.length > 1 && <button type="button" className="solution-carousel-control is-next" aria-label="Ver próximos produtos" onClick={() => scroll('right')}><Chevron direction="right" /></button>}
    </div>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
}
