import type { ContentCardData } from '@/components/content/content-data'
import { listPublishedArticlesPublic } from '@/lib/content/article-repository'
import { logger } from '@/lib/logger'
import { ContentSectionView } from './ContentSectionView'

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
