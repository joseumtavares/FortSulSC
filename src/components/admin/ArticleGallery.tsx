'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export type ArticleGalleryImage = {
  id: string
  imageUrl: string
  altText: string
}

type ArticleGalleryProps = {
  articleId: string
  images: ArticleGalleryImage[]
  maxImages: number
}

export function ArticleGallery({ articleId, images, maxImages }: ArticleGalleryProps) {
  const router = useRouter()
  const [alt, setAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const atLimit = images.length >= maxImages

  async function uploadImage(file: File): Promise<{ error?: string } | null> {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('alt', alt)

    const response = await fetch(`/api/admin/articles/${articleId}/images`, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    })
    const data = (await response.json().catch(() => null)) as { error?: string } | null

    return response.ok ? null : (data ?? { error: 'Não foi possível enviar a imagem.' })
  }

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
      const failure = await uploadImage(file)
      if (failure) {
        setError(failure.error ?? 'Não foi possível enviar a imagem.')
        return
      }

      setAlt('')
      fileInput.value = ''
      router.refresh()
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemove(imageId: string) {
    setRemovingId(imageId)
    setError(null)

    try {
      const response = await fetch(`/api/admin/articles/${articleId}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setError(data?.error ?? 'Não foi possível remover a imagem.')
        return
      }

      router.refresh()
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-brand-blue-950">Galeria de imagens</h2>
      <p className="text-xs text-brand-muted">
        Até {maxImages} imagens, exibidas ao final do artigo publicado na ordem em que forem enviadas.
      </p>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="space-y-2">
              <img
                src={image.imageUrl}
                alt={image.altText}
                className="h-24 w-full rounded-lg object-cover"
              />
              <p className="truncate text-xs text-brand-muted" title={image.altText}>
                {image.altText}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                disabled={removingId === image.id}
                aria-label={`Remover imagem: ${image.altText}`}
                className="w-full rounded-lg border border-brand-line px-2 py-2 text-xs font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60"
              >
                {removingId === image.id ? 'Removendo…' : 'Remover'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {atLimit ? (
        <p className="text-xs text-brand-muted">Limite de {maxImages} imagens atingido. Remova uma para enviar outra.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="article-gallery-file" className="mb-1 block text-sm font-medium text-brand-blue-950">
              Nova imagem (JPEG, PNG ou WEBP, até 5 MB)
            </label>
            <input id="article-gallery-file" type="file" name="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" />
          </div>

          <div>
            <label htmlFor="article-gallery-alt" className="mb-1 block text-sm font-medium text-brand-blue-950">
              Texto alternativo
            </label>
            <input
              id="article-gallery-alt"
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
            {isUploading ? 'Enviando…' : 'Adicionar imagem'}
          </button>
        </form>
      )}
    </section>
  )
}
