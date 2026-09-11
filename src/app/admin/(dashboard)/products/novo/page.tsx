import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { ProductForm } from '@/components/admin/ProductForm'
import '../../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Novo produto | Painel FortSul', robots: { index: false, follow: false } }
export default function NewProductPage() {
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos produtos</Link>
    <h1 className="mb-8 text-xl font-bold text-brand-blue-950 sm:text-2xl">Novo produto</h1>
    <p className="mb-6 max-w-3xl text-sm text-brand-muted">Depois de criar, você poderá adicionar categorias, imagens, aplicações, especificações e depoimentos na tela de edição.</p>
    <div className="max-w-3xl"><ProductForm /></div>
  </main></AdminShell>
}
