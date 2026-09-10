import type { ContentCardData } from './content-data'

export function ContentCard({ item, onSelect }: { item: ContentCardData; onSelect: () => void }) {
  return (
    <li className="content-carousel-item">
      <button type="button" className="content-card-trigger" onClick={onSelect} aria-haspopup="dialog">
        <article className="content-card">
          <div className="content-card-media">
            {/* Capa vem de storage externo (local:// em dev, R2/Supabase em produção) —
                next/image exige domínio conhecido em remotePatterns, então usa <img>
                puro, mesmo padrão já usado em ArticleCoverUploadForm/ArticleGallery
                no painel. */}
            <img src={item.image.src} alt={item.image.alt} loading="lazy" />
          </div>
          <div className="content-card-body">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </article>
      </button>
    </li>
  )
}
