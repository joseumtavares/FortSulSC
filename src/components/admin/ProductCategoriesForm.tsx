'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string; active: boolean }

export function ProductCategoriesForm({ productId, categories, initialSelectedIds }: { productId: string; categories: Category[]; initialSelectedIds: string[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const categoryIds = form.getAll('categoryIds') as string[]
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/products/${productId}/categories`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as categorias.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Categorias</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Categorias salvas.</p>}
      {categories.length === 0 ? (
        <p className="text-sm text-brand-muted">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <fieldset disabled={saving} className="min-w-0 space-y-2">
          <legend className="sr-only">Selecione as categorias do produto</legend>
          {categories.map((category) => (
            <label key={category.id} className="flex min-h-11 items-center gap-2 text-sm text-brand-blue-950">
              <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={initialSelectedIds.includes(category.id)} className="h-4 w-4 accent-brand-orange" />
              {category.name}
              {!category.active && <span className="text-xs text-brand-muted">(inativa)</span>}
            </label>
          ))}
        </fieldset>
      )}
      <button disabled={saving || categories.length === 0} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Salvando…' : 'Salvar categorias'}
      </button>
    </form>
  )
}
