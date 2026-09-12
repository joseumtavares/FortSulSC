import Link from 'next/link'

type Partner = { id: string; name: string; whatsapp: string; active: boolean }

export function PartnersTable({ partners, emptyLabel }: { partners: Partner[]; emptyLabel: string }) {
  if (partners.length === 0) {
    return <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhum(a) {emptyLabel} cadastrado(a) ainda.</p>
  }

  return (
    <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{emptyLabel}s cadastrados</caption>
        <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Nome</th><th scope="col" className="p-4">WhatsApp</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4">Ação</th></tr></thead>
        <tbody>{partners.map((partner) => <tr key={partner.id} className="border-b border-brand-line">
          <th scope="row" className="p-4 font-medium text-brand-blue-950">{partner.name}</th>
          <td className="p-4 text-brand-muted">{partner.whatsapp}</td>
          <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${partner.active ? 'bg-green-100 text-green-800' : 'bg-brand-surface text-brand-muted'}`}>{partner.active ? 'Ativo' : 'Inativo'}</span></td>
          <td className="p-4"><Link href={`/admin/partners/${partner.id}`} aria-label={`Editar ${partner.name}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}
