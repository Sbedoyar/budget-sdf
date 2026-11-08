// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ReportResultSearch from './ReportResultSearch'

afterEach(cleanup)

const ariaLabel = 'Buscar historial de movimientos'
const placeholder = 'Buscar producto o código...'

function renderSearch(value, onChange = vi.fn()) {
  return render(
    <ReportResultSearch value={value} placeholder={placeholder} ariaLabel={ariaLabel} onChange={onChange} />,
  )
}

describe('ReportResultSearch', () => {
  it('muestra el valor, el placeholder y el nombre accesible recibidos', () => {
    renderSearch('Arroz')

    const input = screen.getByRole('searchbox', { name: ariaLabel })
    expect(input.value).toBe('Arroz')
    expect(input.getAttribute('placeholder')).toBe(placeholder)
  })

  it('envía el nuevo texto al callback al editar la búsqueda', () => {
    const onChange = vi.fn()
    renderSearch('Arroz', onChange)

    fireEvent.change(screen.getByRole('searchbox', { name: ariaLabel }), { target: { value: 'Café' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('Café')
  })

  it('muestra Limpiar solo con texto y envía una cadena vacía al pulsarlo', () => {
    const onChange = vi.fn()
    const { rerender } = renderSearch('Arroz', onChange)

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('')

    rerender(<ReportResultSearch value="" placeholder={placeholder} ariaLabel={ariaLabel} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull()
  })
})
