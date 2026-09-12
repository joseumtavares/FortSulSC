import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountedField } from './CountedField'

describe('CountedField', () => {
  it('starts the counter from the default value length', () => {
    render(<CountedField name="name" label="Nome" maxLength={80} defaultValue="Fulano" />)
    expect(screen.getByText('6/80 caracteres')).toBeTruthy()
  })

  it('updates the counter as the user types in a text input', async () => {
    const user = userEvent.setup()
    render(<CountedField name="name" label="Nome" maxLength={80} />)
    await user.type(screen.getByLabelText('Nome'), 'Teste')
    expect(screen.getByText('5/80 caracteres')).toBeTruthy()
  })

  it('renders a textarea and updates its counter', async () => {
    const user = userEvent.setup()
    render(<CountedField name="description" label="Descrição" type="textarea" maxLength={500} />)
    const field = screen.getByLabelText('Descrição')
    expect(field.tagName).toBe('TEXTAREA')
    await user.type(field, 'Olá')
    expect(screen.getByText('3/500 caracteres')).toBeTruthy()
  })

  it('applies maxLength to the rendered field', () => {
    render(<CountedField name="name" label="Nome" maxLength={80} />)
    expect(screen.getByLabelText('Nome').getAttribute('maxlength')).toBe('80')
  })
})
