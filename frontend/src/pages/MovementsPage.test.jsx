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

it('muestra el historial inicial y el estado vacío al filtrar sin coincidencias', async () => {
  const date = '2026-11-07T10:00:00'
  const entry = {
    id: 1,
    productId: 7,
    productName: 'Arroz',
    date,
    type: 'ENTRADA',
    quantity: 3,
    resultingStock: 12,
    observation: 'Compra a proveedor',
  }
  getMovements.mockResolvedValue([
    entry,
    { ...entry, id: 2, type: 'SALIDA', quantity: 2, resultingStock: 10, observation: '' },
  ])

  render(<MovementsPage />)
  const table = await screen.findByRole('table')
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
  const entryRow = within(table).getByRole('row', { name: /Compra a proveedor/ })
  const exitRow = within(table).getByRole('row', { name: /Sin observación/ })
  expect(within(entryRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    formattedDate, 'Arroz', 'Entrada', '+3', '12', 'Compra a proveedor',
  ])
  expect(within(exitRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    formattedDate, 'Arroz', 'Salida', '-2', '10', 'Sin observación',
  ])

  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar movimientos' }), {
    target: { value: 'Sin coincidencias' },
  })
  expect(screen.getByText('Mostrando 0 de 2 movimientos.')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'No encontramos movimientos' })).toBeTruthy()
  expect(screen.queryByRole('table')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3)
})

it('muestra la carga inicial y luego el historial vacío', async () => {
  render(<MovementsPage />)
  expect(screen.getByText('Cargando movimientos...')).toBeTruthy()
  expect(screen.queryByRole('table')).toBeNull()

  expect(await screen.findByRole('heading', { name: 'No hay movimientos registrados' })).toBeTruthy()
  expect(screen.getByText('Registra la primera entrada o salida para comenzar el historial.')).toBeTruthy()
  expect(screen.queryByText('Cargando movimientos...')).toBeNull()
  expect(screen.queryByRole('table')).toBeNull()
})
