import { prisma } from '@/lib/db/client'

export type DashboardCounts = {
  products: number
  categories: number
  representatives: number
  resellers: number
  banners: number
  articles: number
}

/** Contagens totais ("cadastrados"), não só ativos — cards do dashboard administrativo. */
export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [products, categories, representatives, resellers, banners, articles] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.partner.count({ where: { type: 'REPRESENTATIVE' } }),
    prisma.partner.count({ where: { type: 'RESELLER' } }),
    prisma.banner.count(),
    prisma.article.count(),
  ])
  return { products, categories, representatives, resellers, banners, articles }
}
