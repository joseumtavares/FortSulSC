import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnerForm } from '@/components/admin/PartnerForm'
import { PARTNER_TYPES, type PartnerType } from '@/lib/content/partner-input'
import { AdminShell } from '@/components/admin/AdminShell'
import '../../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Novo parceiro | Painel FortSul', robots: { index: false, follow: false } }

function parseDefaultType(value: string | string[] | undefined): PartnerType {
  const type = Array.isArray(value) ? value[0] : value
  return type && PARTNER_TYPES.includes(type.toUpperCase() as PartnerType) ? (type.toUpperCase() as PartnerType) : 'REPRESENTATIVE'
}

export default async function NewPartnerPage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const { type } = await searchParams
  const defaultType = parseDefaultType(type)

  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/partners" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos parceiros</Link>
    <h1 className="mb-8 text-xl font-bold text-brand-blue-950 sm:text-2xl">Novo parceiro</h1>
    <div className="max-w-xl"><PartnerForm defaultType={defaultType} /></div>
  </main></AdminShell>
}
