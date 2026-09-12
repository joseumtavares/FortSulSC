import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PartnersTable } from './PartnersTable'

const mixedPartners = [
  { id: 'p1', name: 'Fulano de Tal', whatsapp: '5548999990000', active: true, type: 'REPRESENTATIVE' as const },
  { id: 'p2', name: 'Revenda Modelo', whatsapp: '5541988880000', active: false, type: 'RESELLER' as const },
]

describe('PartnersTable', () => {
  it('shows an empty state when there are no partners', () => {
    render(<PartnersTable partners={[]} emptyLabel="parceiro" />)
    expect(screen.getByRole('status').textContent).toContain('Nenhum parceiro cadastrado ainda.')
  })

  it('lists representatives and resellers together, each with its own type label', () => {
    render(<PartnersTable partners={mixedPartners} emptyLabel="parceiro" />)

    const rows = screen.getAllByRole('row')
    expect(rows[1].textContent).toContain('Representante')
    expect(rows[2].textContent).toContain('Revenda')
    expect(screen.getByText('Ativo')).toBeTruthy()
    expect(screen.getByText('Inativo')).toBeTruthy()
  })

  it('filters the list by type, one filter active at a time', async () => {
    const user = userEvent.setup()
    render(<PartnersTable partners={mixedPartners} emptyLabel="parceiro" />)

    await user.click(screen.getByRole('button', { name: 'Representantes' }))
    expect(screen.getByText('Fulano de Tal')).toBeTruthy()
    expect(screen.queryByText('Revenda Modelo')).toBeNull()
    expect(screen.getByRole('button', { name: 'Representantes' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Todos' }).getAttribute('aria-pressed')).toBe('false')

    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Revenda Modelo')).toBeTruthy()
  })
})
