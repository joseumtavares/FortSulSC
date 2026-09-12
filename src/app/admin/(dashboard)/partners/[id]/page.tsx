import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { PartnerForm } from '@/components/admin/PartnerForm'
import { PartnerActiveToggle } from '@/components/admin/PartnerActiveToggle'
import { PartnerDeleteButton } from '@/components/admin/PartnerDeleteButton'
import { PartnerLogoForm } from '@/components/admin/PartnerLogoForm'
import { PartnerCommercialAreasForm } from '@/components/admin/PartnerCommercialAreasForm'
import { findPartnerForAdmin } from '@/lib/content/partner-repository'
import { listCommercialAreasForAdmin } from '@/lib/content/commercial-area-repository'
import type { SocialLinks } from '@/lib/content/social-links'
import '../../../admin-tailwind.css'

export const metadata: Metadata = { title: 'Editar parceiro | Painel FortSul', robots: { index: false, follow: false } }

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [partner, commercialAreas] = await Promise.all([findPartnerForAdmin(id), listCommercialAreasForAdmin()])
  if (!partner) notFound()

  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <Link href="/admin/partners" className="inline-flex min-h-11 items-center text-sm text-brand-blue-950 underline">Voltar aos parceiros</Link>
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Editar parceiro</h1>
      <PartnerActiveToggle partnerId={id} initialActive={partner.active} />
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <PartnerForm
          partnerId={id}
          initial={{
            type: partner.type,
            name: partner.name,
            description: partner.description,
            whatsapp: partner.whatsapp,
            websiteUrl: partner.websiteUrl,
            approximateLat: partner.approximateLat,
            approximateLng: partner.approximateLng,
            socialLinks: partner.socialLinks as SocialLinks | null,
            private: partner.private ? { document: partner.private.document, consentNotes: partner.private.consentNotes } : null,
          }}
        />
        <PartnerDeleteButton partnerId={id} />
      </div>
      <div className="space-y-6">
        <PartnerLogoForm partnerId={id} partnerName={partner.name} logoUrl={partner.logoUrl} />
        <PartnerCommercialAreasForm
          partnerId={id}
          commercialAreas={commercialAreas.map((area) => ({ id: area.id, name: area.name }))}
          initialSelectedIds={partner.commercialAreas.map((link) => link.commercialAreaId)}
        />
      </div>
    </div>
  </main></AdminShell>
}
