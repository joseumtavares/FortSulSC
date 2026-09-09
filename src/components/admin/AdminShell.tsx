import type { ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-brand-surface font-brand-sans text-brand-ink">
      <AdminSidebar />
      {children}
    </div>
  )
}
