import Link from 'next/link'

const TABS = [
  { href: '/admin/partners/representantes', label: 'Representantes' },
  { href: '/admin/partners/revendas', label: 'Revendas' },
] as const

/**
 * São links para páginas diferentes (não troca de conteúdo na mesma tela),
 * então não usa `role="tablist"`/`role="tab"` — esse padrão ARIA exige
 * navegação por seta e um painel associado (ver `AboutTabs`/`CategoryTabs`,
 * os únicos tablists reais do projeto). Aqui o padrão correto é o mesmo já
 * usado em `AdminSidebar`: link de navegação com `aria-current="page"`.
 */
export function PartnerTypeTabs({ activeHref }: { activeHref: (typeof TABS)[number]['href'] }) {
  return (
    <nav aria-label="Filtrar por tipo" className="mb-6 flex gap-2 border-b border-brand-line">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={activeHref === tab.href ? 'page' : undefined}
          className={`min-h-11 border-b-2 px-4 py-2 text-sm font-semibold ${activeHref === tab.href ? 'border-brand-orange text-brand-blue-950' : 'border-transparent text-brand-muted'}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
