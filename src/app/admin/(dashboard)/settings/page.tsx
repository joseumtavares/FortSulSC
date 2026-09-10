import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/AdminShell'
import { InstitutionalSettingsForm } from '@/components/admin/InstitutionalSettingsForm'
import { getInstitutionalSettings } from '@/lib/content/institutional-settings-repository'
import { parseSocialLinks } from '@/lib/content/social-links'
import '../../admin-tailwind.css'
export const metadata: Metadata = { title: 'Configurações | Painel FortSul', robots: { index: false, follow: false } }
export default async function SettingsPage() {
  const settings = await getInstitutionalSettings()
  return <AdminShell><main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
    <h1 className="mb-8 text-xl font-bold text-brand-blue-950 sm:text-2xl">Configurações institucionais</h1>
    <div className="max-w-3xl"><InstitutionalSettingsForm initial={settings ? { whatsapp: settings.whatsapp, phone: settings.phone, email: settings.email, cnpj: settings.cnpj, address: settings.address, socialLinks: parseSocialLinks(settings.socialLinks) ?? null } : undefined} /></div>
  </main></AdminShell>
}
