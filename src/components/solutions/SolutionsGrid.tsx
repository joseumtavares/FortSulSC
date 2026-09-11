'use client'
import { useState } from 'react'
import { CategoryTabs } from './CategoryTabs'
import { ProductScroller } from './ProductScroller'
import type { SolutionCardData, SolutionFilter } from './solutions-data'
import { Reveal } from '@/components/ui/Reveal'

export function SolutionsGrid({ filters, solutions }: { filters: SolutionFilter[]; solutions: SolutionCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('todos')
  const filteredSolutions = activeFilter === 'todos' ? solutions : solutions.filter((solution) => solution.categorySlugs.includes(activeFilter))
  return <><Reveal className="solution-tablist-wrap"><CategoryTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></Reveal><ProductScroller products={filteredSolutions} activeFilter={activeFilter} /></>
}
