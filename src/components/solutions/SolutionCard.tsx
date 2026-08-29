import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'
import type { Solution } from './solutions-data'

export function SolutionCard({ solution, hidden = false, delay = false }: { solution: Solution; hidden?: boolean; delay?: boolean }) {
  const classes = `solution-card${solution.featured ? ' featured' : ''}${hidden ? ' is-hidden' : ''}`
  return <Reveal as="article" delay={delay} className={classes} dataCategory={solution.categories.join(' ')}>
    <div className={`card-media${solution.media.kind === 'split' ? ' split-media' : ''}`}>
      {solution.media.kind === 'single' ? <Image src={solution.media.src} alt={solution.media.alt} fill sizes={solution.media.sizes} /> : solution.media.images.map((image) => <Image key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} style={{ width: '100%', height: 'auto' }} />)}
      {solution.tag && <span className="card-tag">{solution.tag}</span>}
    </div>
    <div className="card-body"><div><span>{solution.displayCategory}</span><h3>{solution.title}</h3></div>
      {solution.featured ? <a href={solution.href} aria-label={solution.ctaLabel}><Arrow /></a> : <WhatsAppTrigger ariaLabel={solution.ctaLabel}><Arrow /></WhatsAppTrigger>}
    </div>
  </Reveal>
}
function Arrow() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg> }
