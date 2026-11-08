// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ReportSummaryCard from './ReportSummaryCard'

afterEach(cleanup)

function renderCard() {
  render(
    <ReportSummaryCard
      className="report-summary-low"
      icon={<svg role="img" aria-label="Alerta de stock" />}
      label="Stock bajo"
      value={0}
      detail="Requieren atención"
    />,
  )

  return screen.getByRole('article')
}

describe('ReportSummaryCard', () => {
  it('presenta el título, el valor cero y el detalle recibidos', () => {
    const card = within(renderCard())

    expect(card.getByText('Stock bajo')).toBeTruthy()
    expect(card.getByText('0')).toBeTruthy()
    expect(card.getByText('Requieren atención')).toBeTruthy()
  })

  it('renderiza el icono y aplica la variante de la tarjeta', () => {
    const card = renderCard()

    expect(within(card).getByRole('img', { name: 'Alerta de stock' })).toBeTruthy()
    expect([...card.classList]).toEqual(expect.arrayContaining(['report-summary-card', 'report-summary-low']))
  })
})
