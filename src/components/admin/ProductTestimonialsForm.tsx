'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MAX_PRODUCT_TESTIMONIALS } from '@/lib/content/testimonial-input'

export type TestimonialItem = { id: string; platform: 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM'; url: string; authorName: string | null }

const PLATFORM_LABELS: Record<TestimonialItem['platform'], string> = { TIKTOK: 'TikTok', FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram' }

export function ProductTestimonialsForm({ productId, testimonials }: { productId: string; testimonials: TestimonialItem[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const atLimit = testimonials.length >= MAX_PRODUCT_TESTIMONIALS

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const body = { platform: data.get('platform'), url: data.get('url'), authorName: data.get('authorName') }
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/products/${productId}/testimonials`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) { setError(result.error ?? 'Não foi possível salvar o depoimento.'); return }
      form.reset()
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    setError('')
    try {
      const response = await fetch(`/api/admin/products/${productId}/testimonials/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível remover o depoimento.'); return }
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setRemovingId(null) }
  }

  return (
    <section className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-brand-blue-950">Depoimentos</h2>
      <p className="text-xs text-brand-muted">Até {MAX_PRODUCT_TESTIMONIALS} links de publicações de parceiros e influenciadores (TikTok, Facebook ou Instagram).</p>

      {testimonials.length > 0 && (
        <ul className="space-y-2">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.id} className="flex items-center justify-between gap-3 rounded-lg border border-brand-line p-3 text-sm">
              <div className="min-w-0">
                <span className="font-semibold text-brand-blue-950">{PLATFORM_LABELS[testimonial.platform]}</span>
                {testimonial.authorName && <span className="text-brand-muted"> — {testimonial.authorName}</span>}
                <a href={testimonial.url} target="_blank" rel="noopener noreferrer" className="block truncate text-brand-muted underline">{testimonial.url}</a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(testimonial.id)}
                disabled={removingId === testimonial.id}
                aria-label={`Remover depoimento ${index + 1} de ${PLATFORM_LABELS[testimonial.platform]}${testimonial.authorName ? ` de ${testimonial.authorName}` : ''}`}
                className="min-h-11 shrink-0 px-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                {removingId === testimonial.id ? 'Removendo…' : 'Remover'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {atLimit ? (
        <p className="text-xs text-brand-muted">Limite de {MAX_PRODUCT_TESTIMONIALS} depoimentos atingido. Remova um para adicionar outro.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="testimonial-platform" className="mb-1 block text-sm font-medium text-brand-blue-950">Rede social</label>
            <select id="testimonial-platform" name="platform" required disabled={saving} className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm">
              <option value="TIKTOK">TikTok</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
          <div>
            <label htmlFor="testimonial-url" className="mb-1 block text-sm font-medium text-brand-blue-950">Link da publicação</label>
            <input id="testimonial-url" name="url" type="url" required disabled={saving} className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="testimonial-author" className="mb-1 block text-sm font-medium text-brand-blue-950">Nome do autor (opcional)</label>
            <input id="testimonial-author" name="authorName" disabled={saving} className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-line bg-white px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60">
            {saving ? 'Salvando…' : 'Adicionar depoimento'}
          </button>
        </form>
      )}
    </section>
  )
}
