// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createMovement, getMovements } from '../services/movementService'
import { getProducts } from '../services/productService'
import MovementsPage from './MovementsPage'

vi.mock('../services/movementService', () => ({
  createMovement: vi.fn(),
  getMovements: vi.fn(),
}))
vi.mock('../services/productService', () => ({ getProducts: vi.fn() }))

const product = { id: 7, code: 'P007', name: 'Arroz', currentStock: 10 }

beforeEach(() => {
  getProducts.mockResolvedValue([product])
  getMovements.mockResolvedValue([])
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

function fillMovement(typeLabel, quantity) {
  fireEvent.click(screen.getByRole('button', { name: 'Producto' }))
  fireEvent.click(screen.getByRole('option', { name: 'P007 - Arroz' }))
  fireEvent.click(screen.getByRole('button', { name: 'Tipo de movimiento' }))
  fireEvent.click(screen.getByRole('option', { name: typeLabel }))
  fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: String(quantity) } })
}

it.each([
  { typeLabel: 'Entrada', type: 'ENTRADA', quantity: 2, resultingStock: 12 },
  { typeLabel: 'Salida', type: 'SALIDA', quantity: 10, resultingStock: 0 },
])('registra una $typeLabel y actualiza el historial', async ({
  typeLabel, type, quantity, resultingStock,
}) => {
  const payload = { productId: 7, type, quantity, observation: 'Ajuste de inventario' }
  createMovement.mockResolvedValue({ resultingStock })
  getMovements.mockResolvedValueOnce([]).mockResolvedValueOnce([{
    ...payload,
    id: 1,
    productName: 'Arroz',
    date: '2026-11-07T10:00:00',
    resultingStock,
  }])

  render(<MovementsPage />)
  await screen.findByText('No hay movimientos registrados')

  const productSelect = screen.getByRole('button', { name: 'Producto' })
  productSelect.scrollIntoView = vi.fn()
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo movimiento' }))
  await waitFor(() => expect(document.activeElement).toBe(productSelect))

  fillMovement(typeLabel, quantity)
  expect(screen.getByText('Stock actual').nextElementSibling.textContent).toBe('10')
  expect(screen.getByText('Stock resultante').nextElementSibling.textContent).toBe(String(resultingStock))
  fireEvent.change(screen.getByLabelText('Observación'), { target: { value: ' Ajuste de inventario ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }))

  expect(createMovement).toHaveBeenCalledExactlyOnceWith(payload)
  expect(await screen.findByText(
    `Movimiento registrado correctamente. Stock resultante: ${resultingStock}`,
  )).toBeTruthy()
  const row = await screen.findByRole('row', { name: /Ajuste de inventario/ })
  expect(within(row).getByRole('cell', { name: typeLabel })).toBeTruthy()
  expect(within(row).getByRole('cell', { name: String(resultingStock) })).toBeTruthy()
  expect(screen.getByLabelText('Cantidad').value).toBe('')
  expect(screen.queryByText('Stock actual')).toBeNull()
})

it('advierte y bloquea una salida superior al stock disponible', async () => {
  render(<MovementsPage />)
  await screen.findByText('No hay movimientos registrados')
  fillMovement('Salida', 11)

  expect(screen.getByText('Stock resultante').nextElementSibling.textContent).toBe('-1')
  expect(screen.getByText('La cantidad solicitada supera el stock disponible.')).toBeTruthy()
  const submitButton = screen.getByRole('button', { name: 'Registrar movimiento' })
  expect(submitButton.disabled).toBe(true)
  fireEvent.click(submitButton)
  expect(createMovement).not.toHaveBeenCalled()

  fireEvent.submit(submitButton.form)
  expect(screen.getByText('La salida supera el stock disponible (10).')).toBeTruthy()
  expect(createMovement).not.toHaveBeenCalled()
})
