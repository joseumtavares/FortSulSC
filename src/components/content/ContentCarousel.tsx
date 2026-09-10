'use client'

import { useState } from 'react'
import { ContentCard } from './ContentCard'
import { ContentArticleDialog } from './ContentArticleDialog'
import type { ContentCardData } from './content-data'

export function ContentCarousel({ items }: { items: ContentCardData[] }) {
  const [activeItem, setActiveItem] = useState<ContentCardData | null>(null)

  return (
    <>
      <div className="content-carousel">
        <ul className="content-track" aria-label="Novidades e dicas">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} onSelect={() => setActiveItem(item)} />
          ))}
          {items.map((item) => (
            <ContentCard key={`${item.id}-duplicado`} item={item} decorative />
          ))}
        </ul>
      </div>

      <ContentArticleDialog item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  )
}
