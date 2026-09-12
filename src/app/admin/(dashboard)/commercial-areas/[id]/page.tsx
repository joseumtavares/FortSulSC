import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { CommercialAreaForm } from '@/components/admin/CommercialAreaForm'
import { CommercialAreaDeleteButton } from '@/components/admin/CommercialAreaDeleteButton'
import { CommercialAreaMunicipalitiesForm } from '@/components/admin/CommercialAreaMunicipalitiesForm'
import { findCommercialAreaForAdmin } from '@/lib/content/commercial-area-repository'
import { listStatesWithMunicipalities } from '@/lib/content/region-repository'
import '../../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Editar área comercial | Painel FortSul', robots: { index: false, follow: false } }

export default async function EditCommercialAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [area, states] = await Promise.all([findCommercialAreaForAdmin(id), listStatesWithMunicipalities()])
  if (!area) notFound()

  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/commercial-areas" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar às áreas comerciais</Link>
    <header className="mb-8">
      <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar área comercial</h1>
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <CommercialAreaForm commercialAreaId={id} initial={{ name: area.name }} />
        <CommercialAreaDeleteButton commercialAreaId={id} />
      </div>
      <div>
        <CommercialAreaMunicipalitiesForm
          commercialAreaId={id}
          states={states}
          initialSelectedIds={area.municipalities.map((link) => link.municipalityId)}
        />
      </div>
    </div>
  </main></AdminShell>
}
