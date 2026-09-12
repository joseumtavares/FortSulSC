import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
import { CommercialAreaMunicipalitiesForm } from './CommercialAreaMunicipalitiesForm'

const states = [
  { id: 's1', name: 'Santa Catarina', uf: 'SC', municipalities: [{ id: 'm1', name: 'Orleans' }, { id: 'm2', name: 'Tubarão' }] },
  { id: 's2', name: 'Paraná', uf: 'PR', municipalities: [{ id: 'm3', name: 'Curitiba' }] },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })))
})

describe('CommercialAreaMunicipalitiesForm', () => {
  it('renders every state as a collapsible group with its municipalities', () => {
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={['m1']} />)
    expect(screen.getByText('Santa Catarina (SC) — 2 município(s)')).toBeTruthy()
    expect(screen.getByText('Paraná (PR) — 1 município(s)')).toBeTruthy()
    expect((screen.getByLabelText('Orleans') as HTMLInputElement).checked).toBe(true)
    expect((screen.getByLabelText('Tubarão') as HTMLInputElement).checked).toBe(false)
  })

  it('hides municipalities that do not match the search without unmounting them', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)
    await user.type(screen.getByLabelText('Buscar município'), 'curi')

    expect(screen.getByLabelText('Orleans').closest('label')).toHaveProperty('hidden', true)
    expect(screen.getByLabelText('Curitiba').closest('label')).toHaveProperty('hidden', false)
    expect(screen.getByText('1 município(s) encontrado(s)')).toBeTruthy()
  })

  it('shows an empty state when no municipality matches the search', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)
    await user.type(screen.getByLabelText('Buscar município'), 'zzz')
    expect(screen.getByText('Nenhum município encontrado.')).toBeTruthy()
  })

  it('keeps a selection made while a search filter is active after the filter is cleared (regression)', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)

    const search = screen.getByLabelText('Buscar município')
    await user.type(search, 'curi')
    await user.click(screen.getByLabelText('Curitiba'))
    expect((screen.getByLabelText('Curitiba') as HTMLInputElement).checked).toBe(true)

    await user.clear(search)
    expect((screen.getByLabelText('Curitiba') as HTMLInputElement).checked).toBe(true)
    expect((screen.getByLabelText('Orleans') as HTMLInputElement).checked).toBe(false)
  })
})
