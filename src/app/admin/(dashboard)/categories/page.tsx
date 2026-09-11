import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { listCategoriesForAdmin } from '@/lib/content/category-repository'
import '../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Categorias | Painel FortSul', robots: { index: false, follow: false } }

export default async function CategoriesPage() {
  const categories = await listCategoriesForAdmin()
  return <AdminShell>
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Categorias</h1>
        <Link href="/admin/categories/novo" className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark">Nova categoria</Link>
      </header>
      {categories.length === 0 ? <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhuma categoria cadastrada. Use “Nova categoria” para começar.</p> :
        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Categorias cadastradas</caption>
            <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Nome</th><th scope="col" className="p-4">Slug</th><th scope="col" className="p-4">Ordem</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4">Ação</th></tr></thead>
            <tbody>{categories.map((category) => <tr key={category.id} className="border-b border-brand-line">
              <th scope="row" className="p-4 font-medium text-brand-blue-950">{category.name}</th>
              <td className="p-4 text-brand-muted">{category.slug}</td>
              <td className="p-4 text-brand-muted">{category.order}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${category.active ? 'bg-green-100 text-green-800' : 'bg-brand-surface text-brand-muted'}`}>{category.active ? 'Ativa' : 'Inativa'}</span></td>
              <td className="p-4"><Link href={`/admin/categories/${category.id}`} aria-label={`Editar ${category.name}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
            </tr>)}</tbody>
          </table>
        </div>}
    </main>
  </AdminShell>
}
