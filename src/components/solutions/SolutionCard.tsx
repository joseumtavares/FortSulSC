import { Reveal } from '@/components/ui/Reveal'
import type { SolutionCardData } from './solutions-data'

export function SolutionCard({ solution, onSelect }: { solution: SolutionCardData; onSelect: () => void }) {
  return <Reveal as="article" className="solution-card" dataCategory={solution.categorySlugs.join(' ')}>
    <button type="button" className="card-trigger" onClick={onSelect} aria-haspopup="dialog">
      <div className="card-media">
        {/* Imagem vem de storage externo (local:// em dev, R2/Supabase em
            produção) — next/image exige domínio conhecido em remotePatterns,
            então usa <img> puro, mesmo padrão já usado em ContentCard. */}
        {solution.heroImage && <img src={solution.heroImage.src} alt={solution.heroImage.alt} width={1600} height={900} />}
      </div>
      <div className="card-body">
        <div>
          {solution.eyebrow && <span>{solution.eyebrow}</span>}
          <h3>{solution.name}</h3>
        </div>
        <span className="card-arrow" aria-hidden="true"><Arrow /></span>
      </div>
    </button>
  </Reveal>
}

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}
