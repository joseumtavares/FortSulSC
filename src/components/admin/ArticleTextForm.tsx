'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type ArticleTextFormProps = {
  articleId?: string
  initialTitle?: string
  initialExcerpt?: string
  initialBody?: string
}

export function ArticleTextForm({
  articleId,
  initialTitle = '',
  initialExcerpt = '',
  initialBody = '',
}: ArticleTextFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [body, setBody] = useState(initialBody)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles'
      const response = await fetch(url, {
        method: articleId ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, body }),
      })
      const data = (await response.json().catch(() => null)) as { id?: string; error?: string } | null

      if (!response.ok) {
        setError(data?.error ?? 'Não foi possível salvar o artigo.')
        return
      }

      if (!articleId && data?.id) {
        router.push(`/admin/articles/${data.id}`)
        return
      }

      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="article-title" className="mb-1 block text-sm font-medium text-brand-blue-950">
          Título
        </label>
        <input
          id="article-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="article-excerpt" className="mb-1 block text-sm font-medium text-brand-blue-950">
          Resumo
        </label>
        <textarea
          id="article-excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          rows={2}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="article-body" className="mb-1 block text-sm font-medium text-brand-blue-950">
          Corpo
        </label>
        <textarea
          id="article-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          rows={14}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {isSaving ? 'Salvando…' : 'Salvar'}
      </button>
    </form>
  )
}
