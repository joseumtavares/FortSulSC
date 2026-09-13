'use client'

import { useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

type ArticlePublishToggleProps = {
  articleId: string
  initialPublished: boolean
}

export function ArticlePublishToggle({ articleId, initialPublished }: ArticlePublishToggleProps) {
  const router = useRouter()
  const [isPublished, setIsPublished] = useState(initialPublished)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked
    setIsSaving(true)
    setError(null)

    try {
      const endpoint = checked ? 'publish' : 'unpublish'
      const response = await fetch(`/api/admin/articles/${articleId}/${endpoint}`, {
        method: 'POST',
        credentials: 'same-origin',
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setError(data?.error ?? 'Não foi possível atualizar a publicação. Tente novamente em instantes.')
        return
      }

      setIsPublished(checked)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="inline-flex items-center gap-2 py-2 text-sm font-medium text-brand-blue-950">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={handleChange}
          disabled={isSaving}
          className="h-4 w-4 accent-brand-orange"
        />
        Publicado
      </label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
