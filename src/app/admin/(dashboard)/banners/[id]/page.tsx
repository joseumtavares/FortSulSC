import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { BannerForm } from '@/components/admin/BannerForm'
import { BannerImageForm } from '@/components/admin/BannerImageForm'
import { BannerActiveToggle } from '@/components/admin/BannerActiveToggle'
import { findBannerForAdmin } from '@/lib/content/banner-repository'
import '../../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Editar banner | Painel FortSul', robots: { index: false, follow: false } }
export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const banner = await findBannerForAdmin(id)
  if (!banner) notFound()
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/banners" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos banners</Link>
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar banner</h1>
      <BannerActiveToggle bannerId={id} initialActive={banner.active} />
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <BannerForm bannerId={id} initial={{ title: banner.title, altText: banner.altText, linkUrl: banner.linkUrl, startAt: banner.startAt?.toISOString() ?? null, endAt: banner.endAt?.toISOString() ?? null }} />
      <BannerImageForm bannerId={id} imageUrl={banner.imageUrl} altText={banner.altText} />
    </div>
  </main></AdminShell>
}
