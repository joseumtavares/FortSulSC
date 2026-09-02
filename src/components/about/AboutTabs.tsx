'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import type { AboutTab, AboutTabId } from './about-tabs-data'

type AboutTabsProps = {
  tabs: AboutTab[]
}

const initialTabRefs: Record<AboutTabId, HTMLButtonElement | null> = {
  fortsul: null,
  historia: null,
  missao: null,
  visao: null,
  valores: null,
  sustentabilidade: null,
}

export function AboutTabs({ tabs }: AboutTabsProps) {
  const [activeId, setActiveId] = useState<AboutTabId>(tabs[0].id)
  const [previousId, setPreviousId] = useState<AboutTabId | null>(null)
  const tabRefs = useRef(initialTabRefs)

  function activate(id: AboutTabId) {
    if (id === activeId) return

    setPreviousId(activeId)
    setActiveId(id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = tabs.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    activate(nextTab.id)
    tabRefs.current[nextTab.id]?.focus()
  }

  return (
    <>
      <div className="about-tablist" role="tablist" aria-label="Seções sobre a FortSul">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId

          return (
            <button
              key={tab.id}
              ref={(node) => { tabRefs.current[tab.id] = node }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`about-tab${isActive ? ' active' : ''}`}
              onClick={() => activate(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.navLabel}
            </button>
          )
        })}
      </div>

      <div className="about-panels">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          const isLeaving = tab.id === previousId

          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              hidden={!isActive && !isLeaving}
              className={`about-panel${isActive ? ' is-active' : ''}${isLeaving ? ' is-leaving' : ''}`}
              onTransitionEnd={(event) => {
                if (isLeaving && event.target === event.currentTarget) setPreviousId(null)
              }}
            >
              <span className="about-panel-eyebrow">{tab.eyebrow}</span>
              <h3>{tab.title}</h3>
              {tab.values ? (
                <div className="about-values-grid">
                  {tab.values.map((value) => (
                    <div key={value.title} className="about-value-item">
                      <strong>{value.title}</strong>
                      <p>{value.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                tab.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              )}
              {tab.highlight && <p className="about-panel-highlight">{tab.highlight}</p>}
            </div>
          )
        })}
      </div>
    </>
  )
}
