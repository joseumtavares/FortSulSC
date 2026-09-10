import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { listArticlesForAdmin } from '@/lib/content/article-repository'
import '../../admin-tailwind.css'

export const metadata: Metadata = {
  title: 'Novidades e dicas | Painel FortSul',
  robots: { index: false, follow: false },
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

export default async function ArticlesListPage() {
  const articles = await listArticlesForAdmin()

  return (
    <AdminShell>
      <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Novidades e dicas</h1>
          <Link
            href="/admin/articles/novo"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
          >
            Novo artigo
          </Link>
        </header>

        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Lista de artigos de novidades e dicas</caption>
            <thead>
              <tr className="border-b border-brand-line text-xs font-semibold uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-brand-muted">
                    Nenhum artigo ainda.
                  </td>
                </tr>
              )}
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-brand-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/articles/${article.id}`} className="font-medium text-brand-blue-950 hover:underline">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {article.status === 'PUBLISHED' ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Publicado
                      </span>
                    ) : (
                      <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-semibold text-brand-muted">
                        Rascunho
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{formatDate(article.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AdminShell>
  )
}
