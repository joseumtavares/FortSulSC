'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronsRight } from 'lucide-react'
import { ACCOUNT_NAV_ITEMS, NAV_ITEMS, type NavItem } from './nav-items'

function NavButton({
  item,
  isSelected,
  isOpen,
  onSelect,
}: {
  item: NavItem
  isSelected: boolean
  isOpen: boolean
  onSelect: (key: string) => void
}) {
  const Icon = item.icon

  const accessibleName = item.badge ? `${item.label}, ${item.badge} pendentes` : item.label

  return (
    <button
      type="button"
      onClick={() => onSelect(item.key)}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={accessibleName}
      className={`relative flex h-11 w-full items-center rounded-lg transition-colors ${
        isSelected ? 'bg-brand-orange/10 text-brand-blue-950 font-semibold' : 'text-brand-muted hover:bg-brand-surface'
      }`}
    >
      <span className="grid h-11 w-12 shrink-0 place-content-center">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      {isOpen && (
        <span className="hidden truncate text-sm md:inline" aria-hidden="true">
          {item.label}
        </span>
      )}
      {isSelected && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-orange" aria-hidden="true" />}
      {item.badge && isOpen && (
        <span
          className="ml-auto mr-3 hidden h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[11px] font-bold text-brand-blue-950 md:flex"
          aria-hidden="true"
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [selected, setSelected] = useState('dashboard')

  return (
    <nav
      aria-label="Navegação do painel"
      className={`sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-brand-line bg-white transition-[width] duration-200 ${
        isOpen ? 'md:w-64' : 'md:w-16'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-brand-line p-4">
        <Image src="/icon.png" alt="FortSul Equipamentos Agrícolas" width={36} height={36} className="shrink-0 rounded-md" />
        {isOpen && (
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-brand-blue-950">FortSulSC</p>
            <p className="truncate text-xs text-brand-muted">Painel administrativo</p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.key} item={item} isSelected={selected === item.key} isOpen={isOpen} onSelect={setSelected} />
        ))}

        {isOpen && (
          <p className="hidden px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-muted md:block">Conta</p>
        )}
        {ACCOUNT_NAV_ITEMS.map((item) => (
          <NavButton key={item.key} item={item} isSelected={selected === item.key} isOpen={isOpen} onSelect={setSelected} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="hidden items-center gap-3 border-t border-brand-line p-3 text-brand-muted transition-colors hover:bg-brand-surface md:flex"
      >
        <span className="grid h-8 w-8 place-content-center">
          <ChevronsRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
        {isOpen ? <span className="text-sm">Recolher menu</span> : <span className="sr-only">Expandir menu</span>}
      </button>
    </nav>
  )
}
