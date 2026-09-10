import type { ContentCardData } from './content-data'

export function ContentCard({
  item,
  onSelect,
  decorative = false,
}: {
  item: ContentCardData
  onSelect?: () => void
  decorative?: boolean
}) {
  const media = (
    <article className="content-card">
      <div className="content-card-media">
        {/* Capa vem de storage externo (local:// em dev, R2 em produção) — next/image
            exige domínio conhecido em remotePatterns, então usa <img> puro, mesmo
            padrão já usado em ArticleCoverUploadForm/ArticleGallery no painel. */}
        <img src={item.image.src} alt={decorative ? '' : item.image.alt} loading="lazy" />
      </div>
      <div className="content-card-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  )

  return (
    <li aria-hidden={decorative || undefined}>
      {onSelect ? (
        <button
          type="button"
          className="content-card-trigger"
          onClick={onSelect}
          aria-haspopup="dialog"
        >
          {media}
        </button>
      ) : (
        media
      )}
    </li>
  )
}
