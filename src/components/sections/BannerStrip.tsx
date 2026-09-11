import type { BannerStripItem } from './BannerStripView'
import { findActiveBannersPublic } from '@/lib/content/banner-repository'
import { logger } from '@/lib/logger'
import { BannerStripView } from './BannerStripView'

function toBannerStripItem(banner: Awaited<ReturnType<typeof findActiveBannersPublic>>[number]): BannerStripItem {
  return { id: banner.id, imageUrl: banner.imageUrl, altText: banner.altText, linkUrl: banner.linkUrl }
}

async function loadActiveBanners(): Promise<BannerStripItem[]> {
  try {
    const banners = await findActiveBannersPublic()
    return banners.map(toBannerStripItem)
  } catch {
    // A home é gerada estaticamente; se o banco estiver indisponível no
    // momento da geração (ex.: build), a faixa simplesmente não aparece em
    // vez de quebrar o build. `revalidatePath('/')` em activate/deactivate/
    // troca de imagem regenera a página assim que o banco responder.
    logger.error('content.public_banners_load_failed')
    return []
  }
}

export async function BannerStrip() {
  const items = await loadActiveBanners()

  return <BannerStripView items={items} />
}
