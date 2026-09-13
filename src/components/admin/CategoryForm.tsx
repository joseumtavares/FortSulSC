'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CharCounter } from './CharCounter'
import { MAX_CATEGORY_NAME_LENGTH } from '@/lib/content/text-limits'

type CategoryValues = { name: string; slug: string; order: number }
type Props = { categoryId?: string; initial?: CategoryValues }
const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'

export function CategoryForm({ categoryId, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [nameLength, setNameLength] = useState(initial?.name?.length ?? 0)

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setNameLength(event.target.value.length)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = { name: form.get('name'), slug: form.get('slug'), order: Number(form.get('order') ?? 0) }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories', {
        method: categoryId ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json() as { id?: string; error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar a categoria. Tente novamente em instantes.'); return }
      if (!categoryId && data.id) router.push(`/admin/categories/${data.id}`)
      setSaved(true)
      router.refresh()
    } catch { setError('Não foi possível salvar. Confira sua conexão e tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Categoria salva.</p>}
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <label className="block text-sm font-medium text-brand-blue-950">Nome
          <input name="name" required maxLength={MAX_CATEGORY_NAME_LENGTH} defaultValue={initial?.name} onChange={handleNameChange} className={inputClass} />
        </label>
        <CharCounter length={nameLength} max={MAX_CATEGORY_NAME_LENGTH} />
        <label className="block text-sm font-medium text-brand-blue-950">Slug
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={initial?.slug} className={inputClass} aria-describedby="category-slug-help" />
        </label>
        <span id="category-slug-help" className="-mt-3 block text-xs text-brand-muted">Letras minúsculas, números e hífen (ex.: aviario, piscicultura).</span>
        <label className="block text-sm font-medium text-brand-blue-950">Ordem de exibição
          <input name="order" type="number" defaultValue={initial?.order ?? 0} className={inputClass} />
        </label>
      </fieldset>
      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">
        {saving ? 'Salvando…' : categoryId ? 'Salvar' : 'Criar categoria'}
      </button>
    </form>
  )
}
