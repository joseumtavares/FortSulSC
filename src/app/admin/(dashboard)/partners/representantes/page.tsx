import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { PartnerTypeTabs } from '@/components/admin/PartnerTypeTabs'
import { PartnersTable } from '@/components/admin/PartnersTable'
import { listPartnersForAdmin } from '@/lib/content/partner-repository'
import '../../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Representantes | Painel FortSul', robots: { index: false, follow: false } }

export default async function RepresentativesPage() {
  const partners = await listPartnersForAdmin('REPRESENTATIVE')
  return <AdminShell>
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Representantes e revendas</h1>
        <Link href="/admin/partners/novo?type=REPRESENTATIVE" className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark">Novo representante</Link>
      </header>
      <PartnerTypeTabs activeHref="/admin/partners/representantes" />
      <PartnersTable partners={partners} emptyLabel="representante" />
    </main>
  </AdminShell>
}
