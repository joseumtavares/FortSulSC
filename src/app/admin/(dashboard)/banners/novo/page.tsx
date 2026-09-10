import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { BannerForm } from '@/components/admin/BannerForm'
import '../../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Novo banner | Painel FortSul', robots: { index: false, follow: false } }
export default function NewBannerPage() {
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/banners" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos banners</Link>
    <h1 className="mb-8 text-xl font-bold text-brand-blue-950 sm:text-2xl">Novo banner</h1>
    <div className="max-w-3xl"><BannerForm /></div>
  </main></AdminShell>
}
