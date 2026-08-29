import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Reveal } from './Reveal'

const originalObserver = globalThis.IntersectionObserver

afterEach(() => {
  globalThis.IntersectionObserver = originalObserver
})

describe('Reveal', () => {
  it('renderiza o conteúdo inicialmente sem revelar quando há observer', () => {
    globalThis.IntersectionObserver = class {
      disconnect = vi.fn()
      observe = vi.fn()
      unobserve = vi.fn()
    } as unknown as typeof IntersectionObserver
    render(<Reveal>Conteúdo</Reveal>)

    expect(screen.getByText('Conteúdo').className).toBe('reveal')
  })

  it('adiciona is-visible quando o elemento entra na área visível', async () => {
    let callback: IntersectionObserverCallback | undefined
    globalThis.IntersectionObserver = class {
      constructor(receivedCallback: IntersectionObserverCallback) {
        callback = receivedCallback
      }
      disconnect = vi.fn()
      observe = vi.fn()
      unobserve = vi.fn()
    } as unknown as typeof IntersectionObserver
    render(<Reveal>Conteúdo</Reveal>)

    callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    await waitFor(() => {
      expect(screen.getByText('Conteúdo').classList.contains('is-visible')).toBe(true)
    })
  })

  it('aplica o atraso opcional', () => {
    globalThis.IntersectionObserver = class {
      disconnect = vi.fn()
      observe = vi.fn()
      unobserve = vi.fn()
    } as unknown as typeof IntersectionObserver
    render(<Reveal delay>Conteúdo</Reveal>)

    expect(screen.getByText('Conteúdo').classList.contains('reveal-delay')).toBe(true)
  })

  it('revela imediatamente sem IntersectionObserver', async () => {
    globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver
    render(<Reveal>Conteúdo</Reveal>)

    await waitFor(() => {
      expect(screen.getByText('Conteúdo').classList.contains('is-visible')).toBe(true)
    })
  })
})
