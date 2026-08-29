'use client'
import { useState } from 'react'
import { SolutionCard } from './SolutionCard'
import { SolutionFilters } from './SolutionFilters'
import type { Solution, SolutionFilterId } from './solutions-data'
import { Reveal } from '@/components/ui/Reveal'

export function SolutionsGrid({ filters, solutions }: { filters: { id: SolutionFilterId; label: string }[]; solutions: Solution[] }) {
  const [activeFilter, setActiveFilter] = useState<SolutionFilterId>('todos')
  const visibleSolutions = activeFilter === 'todos' ? solutions : solutions.filter((solution) => solution.categories.includes(activeFilter))
  return <><Reveal className="solution-filters" ariaLabel="Filtrar soluções"><SolutionFilters filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></Reveal><div className="solutions-grid">{solutions.map((solution, index) => <SolutionCard key={solution.id} solution={solution} delay={index === 1} hidden={!visibleSolutions.includes(solution)} />)}</div><p className="filter-empty" hidden={visibleSolutions.length > 0}>Nenhuma solução desta categoria nesta apresentação.</p></>
}
