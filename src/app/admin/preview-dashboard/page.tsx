import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/AdminShell'
import { PreviewDashboardOverview } from '@/components/admin-preview/PreviewDashboardOverview'
import '../admin-tailwind.css'

export const metadata: Metadata = {
  title: 'Prévia do painel | FortSul',
  robots: { index: false, follow: false },
}

export default function PreviewDashboardPage() {
  return (
    <div>
      <p className="border-b border-black/10 bg-brand-blue-950 px-4 py-2 text-center text-xs font-semibold text-white">
        PRÉVIA VISUAL — Fase 4, Fatia 1. Dados fictícios, sem sessão nem dado real. Não é o painel administrativo final.
      </p>
      <AdminShell>
        <PreviewDashboardOverview />
      </AdminShell>
    </div>
  )
}
