'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Row = { label: string; value: string }

export function ProductSpecificationsForm({ productId, initialRows }: { productId: string; initialRows: Row[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(initialRows.length > 0 ? initialRows : [{ label: '', value: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)))
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const specifications = rows
      .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
      .filter((row) => row.label && row.value)
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/products/${productId}/specifications`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specifications }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as especificações.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Especificações</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Especificações salvas.</p>}
      <fieldset disabled={saving} className="min-w-0 space-y-2">
        <legend className="sr-only">Lista de especificações do produto</legend>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={row.label}
              onChange={(event) => updateRow(index, 'label', event.target.value)}
              aria-label={`Rótulo da especificação ${index + 1}`}
              placeholder="Ex.: Potência"
              className="min-w-0 rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
            <input
              value={row.value}
              onChange={(event) => updateRow(index, 'value', event.target.value)}
              aria-label={`Valor da especificação ${index + 1}`}
              placeholder="Ex.: 5 HP"
              className="min-w-0 rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
            <button type="button" onClick={() => removeRow(index)} aria-label={`Remover especificação ${index + 1}`} className="min-h-11 w-fit shrink-0 justify-self-start px-2 text-sm font-semibold text-red-700">Remover</button>
          </div>
        ))}
      </fieldset>
      <button type="button" disabled={saving} onClick={() => setRows((current) => [...current, { label: '', value: '' }])} className="min-h-11 rounded-lg border border-brand-line px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60">
        Adicionar especificação
      </button>
      <div>
        <button disabled={saving} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Salvando…' : 'Salvar especificações'}
        </button>
      </div>
    </form>
  )
}
