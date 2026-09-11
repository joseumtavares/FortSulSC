'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { SolutionFilter } from './solutions-data'

type CategoryTabsProps = {
  filters: SolutionFilter[]
  activeFilter: string
  onFilterChange: (id: string) => void
}

export function CategoryTabs({ filters, activeFilter, onFilterChange }: CategoryTabsProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isMounted, setIsMounted] = useState(false)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = filters.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return

    event.preventDefault()
    const nextFilter = filters[nextIndex]
    onFilterChange(nextFilter.id)
    tabRefs.current[nextFilter.id]?.focus()
  }

  return (
    <div className="solution-tablist" role="tablist" aria-label="Filtrar soluções">
      {filters.map((filter, index) => {
        const isActive = filter.id === activeFilter

        return (
          <button
            key={filter.id}
            ref={(node) => { tabRefs.current[filter.id] = node }}
            type="button"
            role="tab"
            id={`solution-tab-${filter.id}`}
            aria-selected={isActive}
            aria-controls="solution-panel"
            tabIndex={isActive ? 0 : -1}
            className={`solution-tab${isActive ? ' active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {isMounted && isActive && !shouldReduceMotion && (
              <motion.span
                layoutId="solution-tab-indicator"
                className="solution-tab-indicator"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="solution-tab-label">{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
