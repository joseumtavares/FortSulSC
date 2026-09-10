import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/AdminShell'
import { ArticleTextForm } from '@/components/admin/ArticleTextForm'
import '../../../admin-tailwind.css'

export const metadata: Metadata = {
  title: 'Novo artigo | Painel FortSul',
  robots: { index: false, follow: false },
}

export default function NewArticlePage() {
  return (
    <AdminShell>
      <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
        <h1 className="mb-8 break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Novo artigo</h1>
        <div className="max-w-2xl">
          <ArticleTextForm />
        </div>
      </main>
    </AdminShell>
  )
}
