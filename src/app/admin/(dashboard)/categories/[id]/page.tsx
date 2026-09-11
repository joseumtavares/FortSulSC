import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { CategoryActiveToggle } from '@/components/admin/CategoryActiveToggle'
import { CategoryDeleteButton } from '@/components/admin/CategoryDeleteButton'
import { findCategoryForAdmin } from '@/lib/content/category-repository'
import '../../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Editar categoria | Painel FortSul', robots: { index: false, follow: false } }
export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await findCategoryForAdmin(id)
  if (!category) notFound()
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/categories" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar às categorias</Link>
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar categoria</h1>
      <CategoryActiveToggle categoryId={id} initialActive={category.active} />
    </header>
    <div className="max-w-xl space-y-6">
      <CategoryForm categoryId={id} initial={{ name: category.name, slug: category.slug, order: category.order }} />
      <CategoryDeleteButton categoryId={id} />
    </div>
  </main></AdminShell>
}
