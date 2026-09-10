import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { ArticleTextForm } from '@/components/admin/ArticleTextForm'
import { ArticleCoverUploadForm } from '@/components/admin/ArticleCoverUploadForm'
import { ArticlePublishToggle } from '@/components/admin/ArticlePublishToggle'
import { ArticleGallery } from '@/components/admin/ArticleGallery'
import { findArticleForAdmin } from '@/lib/content/article-repository'
import { MAX_ARTICLE_IMAGES, listArticleImages } from '@/lib/content/article-image-repository'
import '../../../admin-tailwind.css'

export const metadata: Metadata = {
  title: 'Editar artigo | Painel FortSul',
  robots: { index: false, follow: false },
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await findArticleForAdmin(id)
  if (!article) notFound()
  const images = await listArticleImages(id)

  return (
    <AdminShell>
      <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar artigo</h1>
          <ArticlePublishToggle articleId={article.id} initialPublished={article.status === 'PUBLISHED'} />
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <ArticleTextForm
            articleId={article.id}
            initialTitle={article.title}
            initialExcerpt={article.excerpt ?? ''}
            initialBody={article.body}
          />
          <ArticleCoverUploadForm
            articleId={article.id}
            currentUrl={article.coverImageUrl}
            currentAlt={article.coverImageAlt}
          />
        </div>

        <div className="mt-6">
          <ArticleGallery
            articleId={article.id}
            images={images.map((image) => ({ id: image.id, imageUrl: image.imageUrl, altText: image.altText }))}
            maxImages={MAX_ARTICLE_IMAGES}
          />
        </div>
      </main>
    </AdminShell>
  )
}
