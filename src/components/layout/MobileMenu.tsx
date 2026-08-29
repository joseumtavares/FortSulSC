'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export function MobileMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', isOpen)
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 820) closeMenu()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeMenu])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen && event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeMenu, isOpen])

  return (
    <>
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="main-nav"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span className="sr-only">{isOpen ? 'Fechar menu' : 'Abrir menu'}</span>
      </button>
      <nav
        id="main-nav"
        className={`main-nav${isOpen ? ' is-open' : ''}`}
        aria-label="Navegação principal"
        onClick={() => closeMenu()}
      >
        {children}
      </nav>
    </>
  )
}
