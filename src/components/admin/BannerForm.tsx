'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type BannerValues = { title: string; altText: string; linkUrl: string | null; startAt: string | null; endAt: string | null }
type Props = { bannerId?: string; initial?: BannerValues }
const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'

function localDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function prepareDates(form: FormData) {
  for (const field of ['startAt', 'endAt']) {
    const value = form.get(field)
    form.set(field, typeof value === 'string' && value ? new Date(value).toISOString() : '')
  }
}

export function BannerForm({ bannerId, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      prepareDates(form)
      const response = await fetch(bannerId ? `/api/admin/banners/${bannerId}` : '/api/admin/banners', {
        method: bannerId ? 'PATCH' : 'POST', credentials: 'same-origin',
        headers: bannerId ? { 'Content-Type': 'application/json' } : undefined,
        body: bannerId ? JSON.stringify(Object.fromEntries(form)) : form,
      })
      const data = await response.json() as { id?: string; error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar o banner.'); return }
      if (!bannerId && data.id) router.push(`/admin/banners/${data.id}`)
      setSaved(true)
      router.refresh()
    } catch { setError('Não foi possível salvar. Confira sua conexão e tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Banner salvo.</p>}
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <label className="block text-sm font-medium text-brand-blue-950">Título
          <input name="title" required defaultValue={initial?.title} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-brand-blue-950">Texto alternativo
          <input name="altText" required defaultValue={initial?.altText} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-brand-blue-950">Link (opcional)
          <input name="linkUrl" type="url" defaultValue={initial?.linkUrl ?? ''} className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0 text-sm font-medium text-brand-blue-950">Início (opcional)
            <input name="startAt" type="datetime-local" defaultValue={localDate(initial?.startAt)} className={inputClass} />
          </label>
          <label className="block min-w-0 text-sm font-medium text-brand-blue-950">Fim (opcional)
            <input name="endAt" type="datetime-local" defaultValue={localDate(initial?.endAt)} className={inputClass} />
          </label>
        </div>
        <p className="text-sm text-brand-muted">Datas e horários no fuso do seu dispositivo. Sem datas, não há limite de período. O banner precisa estar ativo para ser elegível à exibição.</p>
        {!bannerId && <div><label className="block text-sm font-medium text-brand-blue-950">Imagem
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required aria-describedby="banner-image-help" className={inputClass} />
        </label>
          <span id="banner-image-help" className="mt-1 block text-xs text-brand-muted">JPEG, PNG ou WEBP, até 5 MB. O banner será criado inativo.</span>
        </div>}
      </fieldset>
      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">
        {saving ? 'Salvando…' : bannerId ? 'Salvar' : 'Criar banner'}
      </button>
    </form>
  )
}
