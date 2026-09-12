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
  it('shows the already-selected municipalities as chips', () => {
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={['m1']} />)
    expect(screen.getByText('1 município(s) atendido(s)')).toBeTruthy()
    expect(screen.getByText('Orleans (SC)')).toBeTruthy()
  })

  it('shows an empty state when nothing is selected yet', () => {
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)
    expect(screen.getByText('Nenhum município adicionado ainda.')).toBeTruthy()
  })

  it('searches by name and adds a municipality to the selected list on click', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)

    await user.type(screen.getByLabelText('Adicionar município'), 'curi')
    await user.click(await screen.findByRole('option', { name: /Curitiba/ }))

    expect(screen.getByText('Curitiba (PR)')).toBeTruthy()
    expect(screen.getByText('1 município(s) atendido(s)')).toBeTruthy()
    expect((screen.getByLabelText('Adicionar município') as HTMLInputElement).value).toBe('')
  })

  it('does not suggest a municipality that is already selected', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={['m3']} />)
    await user.type(screen.getByLabelText('Adicionar município'), 'curi')
    expect(screen.queryByRole('option', { name: /Curitiba/ })).toBeNull()
    expect(screen.getByText('Nenhum município encontrado ou já adicionado.')).toBeTruthy()
  })

  it('adds the highlighted suggestion when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={[]} />)
    await user.type(screen.getByLabelText('Adicionar município'), 'orl')
    await user.keyboard('{Enter}')
    expect(screen.getByText('Orleans (SC)')).toBeTruthy()
  })

  it('removes a municipality from the selected list', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={['m1', 'm2']} />)
    await user.click(screen.getByLabelText('Remover Orleans'))
    expect(screen.queryByText('Orleans (SC)')).toBeNull()
    expect(screen.getByText('Tubarão (SC)')).toBeTruthy()
    expect(screen.getByText('1 município(s) atendido(s)')).toBeTruthy()
  })

  it('saves the selected municipality ids', async () => {
    const user = userEvent.setup()
    render(<CommercialAreaMunicipalitiesForm commercialAreaId="a1" states={states} initialSelectedIds={['m1']} />)
    await user.type(screen.getByLabelText('Adicionar município'), 'curi')
    await user.click(await screen.findByRole('option', { name: /Curitiba/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar municípios' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/commercial-areas/a1/municipalities',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ municipalityIds: ['m1', 'm3'] }) }),
    )
    expect(await screen.findByText('Municípios salvos.')).toBeTruthy()
  })
})
