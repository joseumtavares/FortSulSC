'use client'

import { createElement, useEffect, useRef, useState, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: boolean
  as?: 'article' | 'div' | 'li'
  dataCategory?: string
  ariaLabel?: string
}

export function Reveal({ children, className, delay = false, as = 'div', dataCategory, ariaLabel }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return createElement(as, {
    ref,
    'aria-label': ariaLabel,
    'data-category': dataCategory,
    className: ['reveal', delay && 'reveal-delay', isVisible && 'is-visible', className].filter(Boolean).join(' '),
  }, children)
}
