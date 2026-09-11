import { listActiveCategoriesPublic } from '@/lib/content/category-repository'
import { listActiveProductsPublic } from '@/lib/content/product-repository'
import { buildProductWhatsAppLink } from '@/lib/content/product-whatsapp'
import { SolutionsGrid } from '@/components/solutions/SolutionsGrid'
import type { SolutionCardData, SolutionFilter } from '@/components/solutions/solutions-data'
import { Reveal } from '@/components/ui/Reveal'
import { logger } from '@/lib/logger'

type Catalog = { filters: SolutionFilter[]; products: SolutionCardData[] }

function toSolutionCardData(product: Awaited<ReturnType<typeof listActiveProductsPublic>>[number]): SolutionCardData {
  const hero = product.images.find((image) => image.role === 'HERO') ?? product.images[0] ?? null

  return {
    id: product.id,
    slug: product.slug,
    code: product.code,
    name: product.name,
    eyebrow: product.eyebrow,
    shortDescription: product.shortDescription,
    description: product.description,
    catalogUrl: product.catalogUrl,
    categorySlugs: product.categories.map((link) => link.category.slug),
    applications: product.applications.map((application) => application.label),
    specifications: product.specifications,
    heroImage: hero ? { src: hero.imageUrl, alt: hero.altText } : null,
    gallery: product.images.filter((image) => image.role === 'GALLERY').map((image) => ({ src: image.imageUrl, alt: image.altText })),
    testimonials: product.testimonials,
    whatsappLink: buildProductWhatsAppLink({ name: product.name, whatsappMessageTemplate: product.whatsappMessageTemplate }),
  }
}

async function loadCatalog(): Promise<Catalog> {
  try {
    const [categories, products] = await Promise.all([listActiveCategoriesPublic(), listActiveProductsPublic()])
    const filters: SolutionFilter[] = [{ id: 'todos', label: 'Todos' }, ...categories.map((category) => ({ id: category.slug, label: category.name }))]
    return { filters, products: products.map(toSolutionCardData) }
  } catch {
    // A home é gerada estaticamente; se o banco estiver indisponível no
    // momento da geração (ex.: build), a seção cai para o estado vazio em
    // vez de quebrar o build. `revalidatePath('/')` nas rotas de produto e
    // categoria regenera a página assim que o banco responder.
    logger.error('content.public_products_load_failed')
    return { filters: [{ id: 'todos', label: 'Todos' }], products: [] }
  }
}

export async function SolutionsSection() {
  const { filters, products } = await loadCatalog()

  return (
    <section className="section solutions" id="solucoes" aria-labelledby="solutions-title">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow eyebrow-light">Nossas soluções</span>
            <h2 id="solutions-title">Equipamentos pensados<br /> para o seu processo.</h2>
          </div>
          <p>Escolha uma área para explorar as possibilidades da linha FortSul.</p>
        </Reveal>

        {products.length > 0 ? <SolutionsGrid filters={filters} solutions={products} /> : <p className="content-empty">Em breve, novos produtos por aqui.</p>}
      </div>
    </section>
  )
}
