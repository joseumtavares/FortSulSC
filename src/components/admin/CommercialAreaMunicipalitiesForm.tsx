'use client'

import { useMemo, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

type Municipality = { id: string; name: string }
type StateWithMunicipalities = { id: string; name: string; uf: string; municipalities: Municipality[] }
type FlatMunicipality = { id: string; name: string; uf: string }

const MAX_SUGGESTIONS = 8

function flattenMunicipalities(states: StateWithMunicipalities[]): FlatMunicipality[] {
  return states.flatMap((state) => state.municipalities.map((municipality) => ({ id: municipality.id, name: municipality.name, uf: state.uf })))
}

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
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)

  const allMunicipalities = useMemo(() => flattenMunicipalities(states), [states])
  const byId = useMemo(() => new Map(allMunicipalities.map((municipality) => [municipality.id, municipality])), [allMunicipalities])
  const selected = selectedIds.map((id) => byId.get(id)).filter((municipality): municipality is FlatMunicipality => Boolean(municipality))

  const searchTerm = query.trim().toLowerCase()
  const suggestions = useMemo(() => {
    if (!searchTerm) return []
    return allMunicipalities.filter((municipality) => !selectedIds.includes(municipality.id) && municipality.name.toLowerCase().includes(searchTerm)).slice(0, MAX_SUGGESTIONS)
  }, [allMunicipalities, searchTerm, selectedIds])

  function addMunicipality(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current : [...current, id]))
    setQuery('')
    setHighlightedIndex(0)
  }

  function removeMunicipality(id: string) {
    setSelectedIds((current) => current.filter((existing) => existing !== id))
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      addMunicipality(suggestions[highlightedIndex].id)
    } else if (event.key === 'Escape') {
      setQuery('')
    }
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch(`/api/admin/commercial-areas/${commercialAreaId}/municipalities`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalityIds: selectedIds }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar os municípios.'); return }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Falha de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const activeOptionId = suggestions.length > 0 ? `commercial-area-municipality-option-${suggestions[highlightedIndex]?.id}` : undefined

  return (
    <div className="space-y-4 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-blue-950">Municípios cobertos</h2>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Municípios salvos.</p>}

      <div className="relative">
        <label htmlFor="commercial-area-municipality-search" className="mb-1 block text-sm font-medium text-brand-blue-950">Adicionar município</label>
        <input
          id="commercial-area-municipality-search"
          type="text"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="commercial-area-municipality-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setHighlightedIndex(0) }}
          onKeyDown={onSearchKeyDown}
          disabled={saving}
          placeholder="Digite o nome do município e selecione para adicionar"
          autoComplete="off"
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
        />
        {suggestions.length > 0 && (
          <ul id="commercial-area-municipality-listbox" role="listbox" aria-label="Municípios encontrados" className="absolute z-10 mt-1 w-full rounded-lg border border-brand-line bg-white shadow-lg">
            {suggestions.map((municipality, index) => (
              <li
                key={municipality.id}
                id={`commercial-area-municipality-option-${municipality.id}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => addMunicipality(municipality.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex min-h-11 w-full cursor-pointer items-center justify-between px-3 py-2 text-sm text-brand-blue-950 ${index === highlightedIndex ? 'bg-brand-surface' : ''}`}
              >
                <span>{municipality.name}</span>
                <span className="text-xs text-brand-muted">{municipality.uf}</span>
              </li>
            ))}
          </ul>
        )}
        {searchTerm && suggestions.length === 0 && <p className="mt-1 text-xs text-brand-muted">Nenhum município encontrado ou já adicionado.</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brand-blue-950">{selected.length} município(s) atendido(s)</p>
        {selected.length === 0 ? (
          <p className="text-sm text-brand-muted">Nenhum município adicionado ainda.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {selected.map((municipality) => (
              <li key={municipality.id} className="flex items-center gap-1 rounded-full border border-brand-line bg-brand-surface py-1 pl-3 pr-1 text-sm text-brand-blue-950">
                {municipality.name} ({municipality.uf})
                <button
                  type="button"
                  onClick={() => removeMunicipality(municipality.id)}
                  disabled={saving}
                  aria-label={`Remover ${municipality.name}`}
                  className="flex min-h-8 min-w-8 items-center justify-center rounded-full text-brand-muted hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={save} disabled={saving} className="min-h-11 rounded-lg bg-brand-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Salvando…' : 'Salvar municípios'}
      </button>
    </div>
  )
}
