'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Municipality = { id: string; name: string }
type StateWithMunicipalities = { id: string; name: string; uf: string; municipalities: Municipality[] }

export function CommercialAreaMunicipalitiesForm({
  commercialAreaId,
  states,
  initialSelectedIds,
}: {
  commercialAreaId: string
  states: StateWithMunicipalities[]
  initialSelectedIds: string[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const searchTerm = search.trim().toLowerCase()

  /**
   * Os checkboxes ficam sempre montados no DOM (não são removidos por
   * `.filter()`) e a busca só alterna `hidden` — remover do array desmontava
   * o checkbox ao filtrar, e ele voltava para `defaultChecked` (valor
   * original do servidor) ao remontar, perdendo silenciosamente a marcação
   * feita durante a busca (achado do ui-reviewer).
   */
  const visibleCounts = useMemo(
    () => states.map((state) => state.municipalities.filter((municipality) => municipality.name.toLowerCase().includes(searchTerm)).length),
    [states, searchTerm],
  )
  const totalVisible = visibleCounts.reduce((sum, count) => sum + count, 0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const municipalityIds = form.getAll('municipalityIds') as string[]
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/commercial-areas/${commercialAreaId}/municipalities`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalityIds }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar os municípios.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Municípios cobertos</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Municípios salvos.</p>}

      <div>
        <label htmlFor="commercial-area-municipality-search" className="mb-1 block text-sm font-medium text-brand-blue-950">Buscar município</label>
        <input
          id="commercial-area-municipality-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Digite para filtrar"
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
        <p role="status" className="mt-1 text-xs text-brand-muted">{searchTerm ? `${totalVisible} município(s) encontrado(s)` : `${states.reduce((sum, state) => sum + state.municipalities.length, 0)} município(s) no total`}</p>
      </div>

      <fieldset disabled={saving} className="min-w-0 space-y-3">
        <legend className="sr-only">Selecione os municípios cobertos por esta área comercial</legend>
        {totalVisible === 0 && <p className="text-sm text-brand-muted">Nenhum município encontrado.</p>}
        {states.map((state, stateIndex) => (
          <details key={state.id} open={searchTerm !== ''} hidden={visibleCounts[stateIndex] === 0} className="rounded-lg border border-brand-line p-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand-blue-950">{state.name} ({state.uf}) — {state.municipalities.length} município(s)</summary>
            <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">
              {state.municipalities.map((municipality) => (
                <label key={municipality.id} hidden={!municipality.name.toLowerCase().includes(searchTerm)} className="flex min-h-11 items-center gap-2 text-sm text-brand-blue-950">
                  <input type="checkbox" name="municipalityIds" value={municipality.id} defaultChecked={initialSelectedIds.includes(municipality.id)} className="h-4 w-4 accent-brand-orange" />
                  {municipality.name}
                </label>
              ))}
            </div>
          </details>
        ))}
      </fieldset>

      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Salvando…' : 'Salvar municípios'}
      </button>
    </form>
  )
}
