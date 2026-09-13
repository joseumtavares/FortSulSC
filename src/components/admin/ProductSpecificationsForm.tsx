'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CharCounter } from './CharCounter'
import { MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH, MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH } from '@/lib/content/text-limits'

type Row = { label: string; value: string }

const QUICK_ADD_SPECS = [
  { label: 'Altura', placeholder: 'Ex.: 1,20 m' },
  { label: 'Largura', placeholder: 'Ex.: 0,80 m' },
  { label: 'Comprimento', placeholder: 'Ex.: 2,50 m' },
  { label: 'Peso', placeholder: 'Ex.: 85 kg' },
]

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

  function addQuickSpec(label: string) {
    setRows((current) => {
      const blankIndex = current.findIndex((row) => !row.label && !row.value)
      const nextRow = { label, value: '' }
      if (blankIndex === -1) return [...current, nextRow]
      return current.map((row, index) => (index === blankIndex ? nextRow : row))
    })
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
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as especificações. Tente novamente em instantes.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Especificações</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Especificações salvas.</p>}
      <div>
        <p className="mb-2 text-xs text-brand-muted">Atalhos para dimensões:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_SPECS.map((quickSpec) => (
            <button
              key={quickSpec.label}
              type="button"
              disabled={saving}
              onClick={() => addQuickSpec(quickSpec.label)}
              className="min-h-9 rounded-lg border border-brand-line px-3 text-xs font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60"
            >
              + {quickSpec.label}
            </button>
          ))}
        </div>
      </div>
      <fieldset disabled={saving} className="min-w-0 space-y-2">
        <legend className="sr-only">Lista de especificações do produto</legend>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <input
                value={row.label}
                onChange={(event) => updateRow(index, 'label', event.target.value)}
                maxLength={MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH}
                aria-label={`Rótulo da especificação ${index + 1}`}
                placeholder="Ex.: Potência"
                className="min-w-0 rounded-lg border border-brand-line px-3 py-2 text-sm"
              />
              <CharCounter length={row.label.length} max={MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH} />
            </div>
            <div>
              <input
                value={row.value}
                onChange={(event) => updateRow(index, 'value', event.target.value)}
                maxLength={MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH}
                aria-label={`Valor da especificação ${index + 1}`}
                placeholder={QUICK_ADD_SPECS.find((quickSpec) => quickSpec.label === row.label)?.placeholder ?? 'Ex.: 5 HP'}
                className="min-w-0 rounded-lg border border-brand-line px-3 py-2 text-sm"
              />
              <CharCounter length={row.value.length} max={MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH} />
            </div>
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
