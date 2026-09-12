'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Partner = { id: string; name: string; whatsapp: string; active: boolean; type: 'REPRESENTATIVE' | 'RESELLER' }
type TypeFilter = 'ALL' | Partner['type']

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'REPRESENTATIVE', label: 'Representantes' },
  { value: 'RESELLER', label: 'Revendas' },
]

function partnerTypeLabel(type: Partner['type']): string {
  return type === 'REPRESENTATIVE' ? 'Representante' : 'Revenda'
}

export function PartnersTable({ partners, emptyLabel }: { partners: Partner[]; emptyLabel: string }) {
  const [filter, setFilter] = useState<TypeFilter>('ALL')
  const filtered = useMemo(() => (filter === 'ALL' ? partners : partners.filter((partner) => partner.type === filter)), [partners, filter])

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-colors ${filter === value ? 'border-brand-orange bg-brand-orange text-white' : 'border-brand-line bg-white text-brand-blue-950 hover:bg-brand-surface'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhum {emptyLabel} cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{emptyLabel}s cadastrados</caption>
            <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Nome</th><th scope="col" className="p-4">Tipo</th><th scope="col" className="p-4">WhatsApp</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4">Ação</th></tr></thead>
            <tbody>{filtered.map((partner) => <tr key={partner.id} className="border-b border-brand-line">
              <th scope="row" className="p-4 font-medium text-brand-blue-950">{partner.name}</th>
              <td className="p-4 text-brand-muted">{partnerTypeLabel(partner.type)}</td>
              <td className="p-4 text-brand-muted">{partner.whatsapp}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${partner.active ? 'bg-green-100 text-green-800' : 'bg-brand-surface text-brand-muted'}`}>{partner.active ? 'Ativo' : 'Inativo'}</span></td>
              <td className="p-4"><Link href={`/admin/partners/${partner.id}`} aria-label={`Editar ${partner.name}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
