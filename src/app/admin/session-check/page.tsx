import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'

export const metadata: Metadata = {
  title: 'Sessão | FortSul',
  robots: { index: false, follow: false },
}

export default async function SessionCheckPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <main id="conteudo" className="admin-session-check">
      <div className="admin-session-check-card">
        <p className="admin-session-check-notice">
          Artefato de teste da Fatia 4.3 — não é o painel administrativo real (Fase 4 ainda não implementada).
        </p>
        <h1>Sessão autenticada</h1>
        <dl>
          <div>
            <dt>Nome</dt>
            <dd>{session.user.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div>
            <dt>Papel</dt>
            <dd>{session.user.role}</dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
