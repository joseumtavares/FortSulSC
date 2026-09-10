import { ContentCarousel } from '@/components/content/ContentCarousel'
import type { ContentCardData } from '@/components/content/content-data'
import { listPublishedArticlesPublic } from '@/lib/content/article-repository'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'
import { logger } from '@/lib/logger'

function toContentCardData(article: Awaited<ReturnType<typeof listPublishedArticlesPublic>>[number]): ContentCardData | null {
  if (!article.coverImageUrl || !article.coverImageAlt) return null

  return {
    id: article.id,
    image: { src: article.coverImageUrl, alt: article.coverImageAlt },
    title: article.title,
    description: article.excerpt ?? '',
    body: article.body,
    gallery: article.images.map((image) => ({ src: image.imageUrl, alt: image.altText })),
  }
}

export function ContentSectionView({ items }: { items: ContentCardData[] }) {
  return (
    <section className="section content-section" id="novidades-e-dicas" aria-labelledby="novidades-e-dicas-title">
      <div className="container">
        <Reveal className="content-heading">
          <div>
            <span className="eyebrow">Dicas FortSul</span>
            <h2 id="novidades-e-dicas-title">Novidades e dicas</h2>
          </div>
          <p>Informações e dicas para ajudar você a conhecer melhor os equipamentos e soluções da FortSul.</p>
        </Reveal>

        {items.length > 0 ? (
          <ContentCarousel items={items} />
        ) : (
          <p className="content-empty">Em breve, novidades e dicas por aqui.</p>
        )}

        <WhatsAppTrigger className="button button-dark content-cta" ariaLabel="Falar com a FortSul pelo WhatsApp">
          Falar com a FortSul
        </WhatsAppTrigger>
      </div>
    </section>
  )
}

async function loadPublishedContentCards(): Promise<ContentCardData[]> {
  try {
    const articles = await listPublishedArticlesPublic()
    return articles.map(toContentCardData).filter((item): item is ContentCardData => item !== null)
  } catch {
    // A home é gerada estaticamente; se o banco estiver indisponível no
    // momento da geração (ex.: build), a seção cai para o estado vazio em
    // vez de quebrar o build. `revalidatePath('/')` em publish/unpublish
    // regenera a página com os dados reais assim que o banco responder.
    logger.error('content.public_articles_load_failed')
    return []
  }
}

export async function ContentSection() {
  const items = await loadPublishedContentCards()

  return <ContentSectionView items={items} />
}
