'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CharCounter } from './CharCounter'
import { MAX_PRODUCT_APPLICATION_LABEL_LENGTH } from '@/lib/content/text-limits'

export function ProductApplicationsForm({ productId, initialLabels }: { productId: string; initialLabels: string[] }) {
  const router = useRouter()
  const [labels, setLabels] = useState<string[]>(initialLabels.length > 0 ? initialLabels : [''])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function updateLabel(index: number, value: string) {
    setLabels((current) => current.map((label, labelIndex) => (labelIndex === index ? value : label)))
  }

  function removeRow(index: number) {
    setLabels((current) => current.filter((_, labelIndex) => labelIndex !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const applications = labels.map((label) => label.trim()).filter(Boolean).map((label) => ({ label }))
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/products/${productId}/applications`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as aplicações.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Aplicações</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Aplicações salvas.</p>}
      <fieldset disabled={saving} className="min-w-0 space-y-2">
        <legend className="sr-only">Lista de aplicações do produto</legend>
        {labels.map((label, index) => (
          <div key={index}>
            <div className="flex items-center gap-2">
              <input
                value={label}
                onChange={(event) => updateLabel(index, event.target.value)}
                maxLength={MAX_PRODUCT_APPLICATION_LABEL_LENGTH}
                aria-label={`Aplicação ${index + 1}`}
                className="w-full min-w-0 rounded-lg border border-brand-line px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeRow(index)} aria-label={`Remover aplicação ${index + 1}`} className="min-h-11 shrink-0 px-2 text-sm font-semibold text-red-700">Remover</button>
            </div>
            <CharCounter length={label.length} max={MAX_PRODUCT_APPLICATION_LABEL_LENGTH} />
          </div>
        ))}
      </fieldset>
      <button type="button" disabled={saving} onClick={() => setLabels((current) => [...current, ''])} className="min-h-11 rounded-lg border border-brand-line px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60">
        Adicionar aplicação
      </button>
      <div>
        <button disabled={saving} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Salvando…' : 'Salvar aplicações'}
        </button>
      </div>
    </form>
  )
}
