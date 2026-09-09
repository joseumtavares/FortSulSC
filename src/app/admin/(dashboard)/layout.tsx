import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'

// Grupo de rotas separado de `/admin/login`: esse layout exige sessão, e
// `/admin/login` não pode exigir sessão sem virar um loop de redirecionamento.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
