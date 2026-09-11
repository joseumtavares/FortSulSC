import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CharCounter } from './CharCounter'

describe('CharCounter', () => {
  it('shows the current length and the limit', () => {
    render(<CharCounter length={12} max={80} />)
    expect(screen.getByText('12/80 caracteres')).toBeTruthy()
  })

  it('highlights when the limit is reached', () => {
    render(<CharCounter length={80} max={80} />)
    expect(screen.getByText('80/80 caracteres').className).toContain('text-red-700')
  })

  it('does not highlight below the limit', () => {
    render(<CharCounter length={79} max={80} />)
    expect(screen.getByText('79/80 caracteres').className).not.toContain('text-red-700')
  })
})
