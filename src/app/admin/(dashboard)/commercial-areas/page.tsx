import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { listCommercialAreasForAdmin } from '@/lib/content/commercial-area-repository'
import '../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Áreas comerciais | Painel FortSul', robots: { index: false, follow: false } }

export default async function CommercialAreasPage() {
  const areas = await listCommercialAreasForAdmin()
  return <AdminShell>
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Áreas comerciais</h1>
        <Link href="/admin/commercial-areas/novo" className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark">Nova área comercial</Link>
      </header>
      {areas.length === 0 ? <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhuma área comercial cadastrada. Use “Nova área comercial” para começar.</p> :
        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Áreas comerciais cadastradas</caption>
            <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Nome</th><th scope="col" className="p-4">Municípios</th><th scope="col" className="p-4">Ação</th></tr></thead>
            <tbody>{areas.map((area) => <tr key={area.id} className="border-b border-brand-line">
              <th scope="row" className="p-4 font-medium text-brand-blue-950">{area.name}</th>
              <td className="p-4 text-brand-muted">{area.municipalities.length}</td>
              <td className="p-4"><Link href={`/admin/commercial-areas/${area.id}`} aria-label={`Editar ${area.name}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
            </tr>)}</tbody>
          </table>
        </div>}
    </main>
  </AdminShell>
}
