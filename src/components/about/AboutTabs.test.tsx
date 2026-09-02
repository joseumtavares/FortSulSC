import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AboutTabs } from './AboutTabs'
import { aboutTabs } from './about-tabs-data'

describe('AboutTabs', () => {
  it('renderiza as seis abas com FortSul selecionada inicialmente', () => {
    render(<AboutTabs tabs={aboutTabs} />)

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'FortSul', 'Nossa História', 'Missão', 'Visão', 'Valores', 'Sustentabilidade',
    ])
    expect(screen.getByRole('tab', { name: 'FortSul' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel', { name: 'FortSul' }).hidden).toBe(false)
  })

  it('seleciona a aba clicada e exibe seu painel', async () => {
    const user = userEvent.setup()
    render(<AboutTabs tabs={aboutTabs} />)

    await user.click(screen.getByRole('tab', { name: 'Nossa História' }))

    expect(screen.getByRole('tab', { name: 'Nossa História' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'FortSul' }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByRole('tabpanel', { name: 'Nossa História' }).hidden).toBe(false)
  })

  it('ativa e move o foco entre abas com as teclas previstas', async () => {
    const user = userEvent.setup()
    render(<AboutTabs tabs={aboutTabs} />)

    const fortsul = screen.getByRole('tab', { name: 'FortSul' })
    fortsul.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Nossa História' }))
    expect(screen.getByRole('tab', { name: 'Nossa História' }).getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Sustentabilidade' }))
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(fortsul)
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Sustentabilidade' }))
  })

  it('renderiza os sete valores como blocos, sem parágrafos do conteúdo institucional', async () => {
    const user = userEvent.setup()
    render(<AboutTabs tabs={aboutTabs} />)

    await user.click(screen.getByRole('tab', { name: 'Valores' }))

    const panel = screen.getByRole('tabpanel', { name: 'Valores' })
    expect(panel.querySelectorAll('.about-value-item')).toHaveLength(7)
    expect(panel.querySelectorAll('.about-value-item p')).toHaveLength(7)
  })
})
