'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function BannerImageForm({ bannerId, imageUrl, altText }: { bannerId: string; imageUrl: string; altText: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const body = new FormData(form)
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}/image`, { method: 'POST', credentials: 'same-origin', body })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível substituir a imagem.'); return }
      form.reset()
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="min-w-0 space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-brand-blue-950">Imagem do banner</h2>
    <img src={imageUrl} alt={altText} className="max-h-64 w-full rounded-lg object-contain" />
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {saved && <p role="status" className="text-sm text-green-800">Imagem substituída.</p>}
    <label className="block text-sm font-medium text-brand-blue-950">Nova imagem
      <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required disabled={saving} className="block w-full min-w-0 text-sm" />
    </label>
    <p className="text-sm text-brand-muted">JPEG, PNG ou WEBP, até 5 MB. Dimensão recomendada: 1600×400px (proporção 4:1).</p>
    <button disabled={saving} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Enviando…' : 'Substituir imagem'}</button>
  </form>
}
