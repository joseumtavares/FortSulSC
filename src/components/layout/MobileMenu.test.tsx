import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileMenu } from './MobileMenu'

function renderMenu() {
  return render(
    <MobileMenu>
      <a href="#empresa">A FortSul</a>
      <a href="#solucoes">Soluções</a>
    </MobileMenu>,
  )
}

describe('MobileMenu', () => {
  it('inicia fechado e abre pelo teclado', async () => {
    const user = userEvent.setup()
    renderMenu()

    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    const navigation = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(navigation.classList.contains('is-open')).toBe(false)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(navigation.classList.contains('is-open')).toBe(true)
  })

  it('fecha ao selecionar um link', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(screen.getByRole('link', { name: 'A FortSul' }))

    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('fecha com Escape e devolve o foco ao toggle', async () => {
    const user = userEvent.setup()
    renderMenu()

    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    await user.click(toggle)
    await user.keyboard('{Escape}')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })
})
