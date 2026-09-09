import { Bell, TrendingUp, User } from 'lucide-react'
import { CATEGORY_USAGE, RECENT_ACTIVITY, STAT_CARDS } from './preview-data'

function TopBar() {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-brand-blue-950 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-brand-muted">Visão geral do conteúdo institucional</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative grid h-10 w-10 place-content-center rounded-lg border border-brand-line bg-white text-brand-muted transition-colors hover:text-brand-blue-950"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="sr-only">Notificações</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-content-center rounded-lg border border-brand-line bg-white text-brand-muted transition-colors hover:text-brand-blue-950"
        >
          <User className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="sr-only">Conta</span>
        </button>
      </div>
    </header>
  )
}

function StatCards() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.key} className="rounded-brand border border-brand-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-9 w-9 place-content-center rounded-lg bg-brand-blue-950/5 text-brand-blue-950">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <TrendingUp className="h-4 w-4 text-brand-orange" aria-hidden="true" />
            </div>
            <p className="text-sm text-brand-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-blue-950">{card.value}</p>
            <p className="mt-1 text-xs text-brand-muted">{card.trend}</p>
          </div>
        )
      })}
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="rounded-brand border border-brand-line bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-4 text-base font-semibold text-brand-blue-950">Atividade recente</h2>
      <ul className="space-y-3">
        {RECENT_ACTIVITY.map((activity) => {
          const Icon = activity.icon
          return (
            <li key={activity.key} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-brand-surface">
              <span className="grid h-9 w-9 shrink-0 place-content-center rounded-lg bg-brand-blue-950/5 text-brand-blue-950">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-blue-950">{activity.title}</p>
                <p className="truncate text-xs text-brand-muted">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-brand-muted">{activity.time}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CategoryUsagePanel() {
  return (
    <div className="rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-brand-blue-950">Produtos por categoria</h2>
      <ul className="space-y-4">
        {CATEGORY_USAGE.map((category) => (
          <li key={category.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-brand-muted">{category.label}</span>
              <span className="font-medium text-brand-blue-950">{category.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-brand-surface">
              <div
                className="h-2 rounded-full bg-brand-orange"
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PreviewDashboardOverview() {
  return (
    <main id="conteudo" className="min-w-0 flex-1 overflow-y-auto bg-brand-surface p-6 lg:p-8">
      <TopBar />
      <StatCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivity />
        <CategoryUsagePanel />
      </div>
    </main>
  )
}
