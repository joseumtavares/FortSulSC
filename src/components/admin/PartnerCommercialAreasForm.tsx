'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type CommercialArea = { id: string; name: string }

export function PartnerCommercialAreasForm({ partnerId, commercialAreas, initialSelectedIds }: { partnerId: string; commercialAreas: CommercialArea[]; initialSelectedIds: string[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const commercialAreaIds = form.getAll('commercialAreaIds') as string[]
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}/commercial-areas`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commercialAreaIds }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as áreas comerciais. Tente novamente em instantes.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Áreas comerciais</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Áreas comerciais salvas.</p>}
      {commercialAreas.length === 0 ? (
        <p className="text-sm text-brand-muted">Nenhuma área comercial cadastrada ainda.</p>
      ) : (
        <fieldset disabled={saving} className="min-w-0 space-y-2">
          <legend className="sr-only">Selecione as áreas comerciais do parceiro</legend>
          {commercialAreas.map((area) => (
            <label key={area.id} className="flex min-h-11 items-center gap-2 text-sm text-brand-blue-950">
              <input type="checkbox" name="commercialAreaIds" value={area.id} defaultChecked={initialSelectedIds.includes(area.id)} className="h-4 w-4 accent-brand-orange" />
              {area.name}
            </label>
          ))}
        </fieldset>
      )}
      <button disabled={saving || commercialAreas.length === 0} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Salvando…' : 'Salvar áreas comerciais'}
      </button>
    </form>
  )
}
