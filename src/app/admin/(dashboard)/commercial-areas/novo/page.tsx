import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { CommercialAreaForm } from '@/components/admin/CommercialAreaForm'
import '../../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Nova área comercial | Painel FortSul', robots: { index: false, follow: false } }
export default function NewCommercialAreaPage() {
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/commercial-areas" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar às áreas comerciais</Link>
    <h1 className="mb-8 text-xl font-bold text-brand-blue-950 sm:text-2xl">Nova área comercial</h1>
    <div className="max-w-xl"><CommercialAreaForm /></div>
  </main></AdminShell>
}
