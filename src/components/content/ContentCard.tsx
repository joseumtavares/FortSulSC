import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import type { ContentCardData } from './content-data'

export function ContentCard({ item, delay = false }: { item: ContentCardData; delay?: boolean }) {
  return (
    <Reveal as="li" delay={delay}>
      <article className="content-card">
        <div className="content-card-media">
          <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" sizes="(max-width: 560px) 100vw, (max-width: 820px) 50vw, 33vw" />
        </div>
        <div className="content-card-body">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </article>
    </Reveal>
  )
}
