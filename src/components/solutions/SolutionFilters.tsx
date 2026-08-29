import type { SolutionFilterId } from './solutions-data'

type Filter = { id: SolutionFilterId; label: string }
export function SolutionFilters({ filters, activeFilter, onFilterChange }: { filters: Filter[]; activeFilter: SolutionFilterId; onFilterChange: (id: SolutionFilterId) => void }) {
  return <>{filters.map((filter) => <button key={filter.id} type="button" className={`filter-button${activeFilter === filter.id ? ' active' : ''}`} aria-pressed={activeFilter === filter.id} data-filter={filter.id} onClick={() => onFilterChange(filter.id)}>{filter.label}</button>)}</>
}
