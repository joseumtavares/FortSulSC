'use client'
import { useState } from 'react'
import { CategoryTabs } from './CategoryTabs'
import { ProductScroller } from './ProductScroller'
import type { Solution, SolutionFilterId } from './solutions-data'
import { Reveal } from '@/components/ui/Reveal'

export function SolutionsGrid({ filters, solutions }: { filters: { id: SolutionFilterId; label: string }[]; solutions: Solution[] }) {
  const [activeFilter, setActiveFilter] = useState<SolutionFilterId>('todos')
  const filteredSolutions = activeFilter === 'todos' ? solutions : solutions.filter((solution) => solution.categories.includes(activeFilter))
  return <><Reveal className="solution-tablist-wrap"><CategoryTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></Reveal><ProductScroller products={filteredSolutions} activeFilter={activeFilter} /></>
}
