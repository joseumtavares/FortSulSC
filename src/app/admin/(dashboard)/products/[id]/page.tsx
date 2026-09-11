import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductActiveToggle } from '@/components/admin/ProductActiveToggle'
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton'
import { ProductCategoriesForm } from '@/components/admin/ProductCategoriesForm'
import { ProductImagesForm } from '@/components/admin/ProductImagesForm'
import { ProductApplicationsForm } from '@/components/admin/ProductApplicationsForm'
import { ProductSpecificationsForm } from '@/components/admin/ProductSpecificationsForm'
import { ProductTestimonialsForm } from '@/components/admin/ProductTestimonialsForm'
import { findProductForAdmin } from '@/lib/content/product-repository'
import { listCategoriesForAdmin } from '@/lib/content/category-repository'
import '../../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Editar produto | Painel FortSul', robots: { index: false, follow: false } }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([findProductForAdmin(id), listCategoriesForAdmin()])
  if (!product) notFound()

  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos produtos</Link>
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar produto</h1>
      <ProductActiveToggle productId={id} initialActive={product.active} />
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <ProductForm
          productId={id}
          initial={{
            code: product.code,
            name: product.name,
            eyebrow: product.eyebrow,
            shortDescription: product.shortDescription,
            description: product.description,
            catalogUrl: product.catalogUrl,
            whatsappMessageTemplate: product.whatsappMessageTemplate,
          }}
        />
        <ProductDeleteButton productId={id} />
      </div>
      <div className="space-y-6">
        <ProductCategoriesForm
          productId={id}
          categories={categories.map((category) => ({ id: category.id, name: category.name, active: category.active }))}
          initialSelectedIds={product.categories.map((link) => link.categoryId)}
        />
        <ProductImagesForm productId={id} images={product.images.map((image) => ({ id: image.id, imageUrl: image.imageUrl, altText: image.altText, role: image.role }))} />
        <ProductApplicationsForm productId={id} initialLabels={product.applications.map((application) => application.label)} />
        <ProductSpecificationsForm productId={id} initialRows={product.specifications.map((specification) => ({ label: specification.label, value: specification.value }))} />
        <ProductTestimonialsForm
          productId={id}
          testimonials={product.testimonials.map((testimonial) => ({ id: testimonial.id, platform: testimonial.platform, url: testimonial.url, authorName: testimonial.authorName }))}
        />
      </div>
    </div>
  </main></AdminShell>
}
