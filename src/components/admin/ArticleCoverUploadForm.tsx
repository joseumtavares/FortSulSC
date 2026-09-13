'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type ArticleCoverUploadFormProps = {
  articleId: string
  currentUrl?: string | null
  currentAlt?: string | null
}

export function ArticleCoverUploadForm({ articleId, currentUrl, currentAlt }: ArticleCoverUploadFormProps) {
  const router = useRouter()
  const [alt, setAlt] = useState(currentAlt ?? '')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fileInput = event.currentTarget.elements.namedItem('file') as HTMLInputElement | null
    const file = fileInput?.files?.[0]

    if (!file) {
      setError('Selecione um arquivo de imagem.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('alt', alt)

      const response = await fetch(`/api/admin/articles/${articleId}/cover`, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setError(data?.error ?? 'Não foi possível enviar a imagem. Tente novamente em instantes.')
        return
      }

      router.refresh()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-brand-blue-950">Imagem de capa</h2>

      {currentUrl && (
        <img src={currentUrl} alt={currentAlt ?? ''} width={1600} height={900} className="h-32 w-full rounded-lg object-cover" />
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="article-cover-file" className="mb-1 block text-sm font-medium text-brand-blue-950">
          Arquivo (JPEG, PNG ou WEBP, até 5 MB)
        </label>
        <p className="mb-2 text-xs text-brand-muted">
          Tamanho ideal: 1200×675px (proporção 16:9). A imagem é sempre recortada para preencher o card do site — evite elementos importantes perto das bordas.
        </p>
        <input
          id="article-cover-file"
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm"
        />
      </div>

      <div>
        <label htmlFor="article-cover-alt" className="mb-1 block text-sm font-medium text-brand-blue-950">
          Texto alternativo
        </label>
        <input
          id="article-cover-alt"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-line bg-white px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60"
      >
        {isUploading ? 'Enviando…' : 'Enviar capa'}
      </button>
    </form>
  )
}
