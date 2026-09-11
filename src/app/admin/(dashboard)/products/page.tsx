import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { listProductsForAdmin } from '@/lib/content/product-repository'
import '../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Produtos | Painel FortSul', robots: { index: false, follow: false } }

export default async function ProductsPage() {
  const products = await listProductsForAdmin()
  return <AdminShell>
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Produtos</h1>
        <Link href="/admin/products/novo" className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark">Novo produto</Link>
      </header>
      {products.length === 0 ? <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhum produto cadastrado. Use “Novo produto” para começar.</p> :
        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Produtos cadastrados</caption>
            <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Código</th><th scope="col" className="p-4">Nome</th><th scope="col" className="p-4">Categorias</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4">Ação</th></tr></thead>
            <tbody>{products.map((product) => <tr key={product.id} className="border-b border-brand-line">
              <td className="p-4 text-brand-muted">{product.code}</td>
              <th scope="row" className="p-4 font-medium text-brand-blue-950">{product.name}</th>
              <td className="p-4 text-brand-muted">{product.categories.map((link) => link.category.name).join(', ') || '—'}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-brand-surface text-brand-muted'}`}>{product.active ? 'Ativo' : 'Inativo'}</span></td>
              <td className="p-4"><Link href={`/admin/products/${product.id}`} aria-label={`Editar ${product.name}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
            </tr>)}</tbody>
          </table>
        </div>}
    </main>
  </AdminShell>
}
