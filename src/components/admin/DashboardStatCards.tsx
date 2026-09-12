import { Boxes, ImageIcon, Newspaper, Package, Store, Users } from 'lucide-react'
import type { DashboardCounts } from '@/lib/content/dashboard-repository'

const CARDS: { key: keyof DashboardCounts; label: string; icon: typeof Package }[] = [
  { key: 'products', label: 'Produtos', icon: Package },
  { key: 'categories', label: 'Categorias', icon: Boxes },
  { key: 'representatives', label: 'Representantes', icon: Users },
  { key: 'resellers', label: 'Revendas', icon: Store },
  { key: 'banners', label: 'Banners', icon: ImageIcon },
  { key: 'articles', label: 'Novidades e dicas', icon: Newspaper },
]

export function DashboardStatCards({ counts }: { counts: DashboardCounts }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-brand border border-brand-line bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-surface text-brand-orange">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </div>
          <dl>
            <dt className="text-sm text-brand-muted">{label}</dt>
            <dd className="text-2xl font-bold text-brand-blue-950">{counts[key]}</dd>
          </dl>
        </div>
      ))}
    </div>
  )
}
