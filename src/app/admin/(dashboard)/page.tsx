import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { AdminShell } from '@/components/admin/AdminShell'
import { LogoutButton } from '@/components/admin/LogoutButton'
import '../admin-tailwind.css'

export const metadata: Metadata = {
  title: 'Painel administrativo | FortSul',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <AdminShell>
      <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="break-words text-xl font-bold text-brand-blue-950 sm:text-2xl">Painel administrativo</h1>
            <p className="mt-1 text-sm text-brand-muted">Bem-vindo(a), {session.user.name}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="max-w-md rounded-brand border border-brand-line bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-brand-blue-950">Sessão autenticada</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-brand-muted">Nome</dt>
              <dd className="font-medium text-brand-blue-950">{session.user.name}</dd>
            </div>
            <div>
              <dt className="text-brand-muted">E-mail</dt>
              <dd className="font-medium text-brand-blue-950">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-brand-muted">Papel</dt>
              <dd className="font-medium text-brand-blue-950">{session.user.role}</dd>
            </div>
          </dl>
        </div>
      </main>
    </AdminShell>
  )
}
