'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function NavWrap({ children }: { children: ReactNode }) {
  const navWrapRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    let headerThreshold = 0

    function updateHeaderThreshold() {
      const navWrap = navWrapRef.current
      if (!navWrap) return

      const wasSticky = navWrap.classList.contains('is-sticky')
      if (wasSticky) navWrap.classList.remove('is-sticky')
      headerThreshold = navWrap.offsetTop + navWrap.offsetHeight
      if (wasSticky) navWrap.classList.add('is-sticky')
    }

    function handleScroll() {
      setIsSticky(window.scrollY > headerThreshold)
    }

    updateHeaderThreshold()
    window.addEventListener('load', updateHeaderThreshold)
    window.addEventListener('resize', updateHeaderThreshold)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('load', updateHeaderThreshold)
      window.removeEventListener('resize', updateHeaderThreshold)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div ref={navWrapRef} className={`nav-wrap${isSticky ? ' is-sticky' : ''}`}>
      {children}
    </div>
  )
}
