'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function PartnerLogoForm({ partnerId, partnerName, logoUrl }: { partnerId: string; partnerName: string; logoUrl: string | null }) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fileInput = event.currentTarget.elements.namedItem('file') as HTMLInputElement | null
    const file = fileInput?.files?.[0]
    if (!file) { setError('Selecione um arquivo de imagem.'); return }

    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('file', file)
      const response = await fetch(`/api/admin/partners/${partnerId}/logo`, { method: 'POST', credentials: 'same-origin', body: formData })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) { setError(data?.error ?? 'Não foi possível enviar a logo. Tente novamente em instantes.'); return }
      fileInput.value = ''
      router.refresh()
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-brand-blue-950">Logo</h2>
      {logoUrl && <img src={logoUrl} alt={`Logo de ${partnerName}`} width={512} height={512} className="h-24 w-24 rounded-lg border border-brand-line object-contain" />}
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="partner-logo-file" className="mb-1 block text-sm font-medium text-brand-blue-950">{logoUrl ? 'Substituir logo' : 'Nova logo'} (JPEG, PNG ou WEBP, até 5 MB)</label>
          <input id="partner-logo-file" type="file" name="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-line bg-white px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60"
        >
          {isUploading ? 'Enviando…' : 'Enviar logo'}
        </button>
      </form>
    </section>
  )
}
