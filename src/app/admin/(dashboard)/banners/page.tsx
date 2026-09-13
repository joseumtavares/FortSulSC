import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { listBannersForAdmin } from '@/lib/content/banner-repository'
import '../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Banners | Painel FortSul', robots: { index: false, follow: false } }
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })
export default async function BannersPage() {
  const banners = await listBannersForAdmin()
  return <AdminShell>
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Banners</h1>
        <Link href="/admin/banners/novo" className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark">Novo banner</Link>
      </header>
      {banners.length === 0 ? <p role="status" className="rounded-brand border border-brand-line bg-white p-6 text-brand-muted">Nenhum banner cadastrado. Use “Novo banner” para começar.</p> :
        <div className="overflow-x-auto rounded-brand border border-brand-line bg-white">
          <table className="w-full text-left text-sm">
            <caption className="p-4 text-left text-brand-muted">Banners ativos e inativos. Agendamento no horário de Brasília.</caption>
            <thead className="border-b border-brand-line text-brand-blue-950"><tr><th scope="col" className="p-4">Imagem</th><th scope="col" className="p-4">Título</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4">Agendamento</th><th scope="col" className="p-4">Ação</th></tr></thead>
            <tbody>{banners.map((banner) => <tr key={banner.id} className="border-b border-brand-line">
              <td className="p-4"><img src={banner.imageUrl} alt={banner.altText} width={1600} height={400} className="h-14 w-24 rounded object-contain" /></td>
              <th scope="row" className="p-4 font-medium text-brand-blue-950">{banner.title}</th>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${banner.active ? 'bg-green-100 text-green-800' : 'bg-brand-surface text-brand-muted'}`}>{banner.active ? 'Ativo' : 'Inativo'}</span></td>
              <td className="p-4">{banner.startAt ? dateFormat.format(banner.startAt) : 'Sem início'}<br />{banner.endAt ? dateFormat.format(banner.endAt) : 'Sem fim'}</td>
              <td className="p-4"><Link href={`/admin/banners/${banner.id}`} aria-label={`Editar ${banner.title}`} className="inline-flex min-h-11 items-center font-semibold text-brand-blue-950 underline">Editar</Link></td>
            </tr>)}</tbody>
          </table>
        </div>}
    </main>
  </AdminShell>
}
