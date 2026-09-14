'use client'
import { useState } from 'react'
import { CategoryTabs } from './CategoryTabs'
import { ProductScroller } from './ProductScroller'
import type { SolutionCardData, SolutionFilter } from './solutions-data'

export function SolutionsGrid({ filters, solutions }: { filters: SolutionFilter[]; solutions: SolutionCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('todos')
  const filteredSolutions = activeFilter === 'todos' ? solutions : solutions.filter((solution) => solution.categorySlugs.includes(activeFilter))
  // Sem <Reveal>: este bloco é `position: sticky` (globals.css
  // `.solution-tablist-wrap`) para permanecer visível durante a troca de
  // filtro. Combinar `transform` (do fade do Reveal) com `position: sticky`
  // no mesmo elemento é sensível no WebKit/Safari — a mesma família de bug
  // que deixava os cards do carrossel vazios (ver SolutionCard.tsx).
  return <><div className="solution-tablist-wrap"><CategoryTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></div><ProductScroller products={filteredSolutions} activeFilter={activeFilter} /></>
}
