// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { getProducts } from '../services/productService'
import { getInventoryReport, getMovementReport } from '../services/reportService'
import ReportsPage from './ReportsPage'

vi.mock('../services/productService', () => ({ getProducts: vi.fn() }))
vi.mock('../services/reportService', () => ({
  getInventoryReport: vi.fn(),
  getMovementReport: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

function deferredReport() {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function movementReport(id, type, observation) {
  const isEntry = type === 'ENTRADA'
  return {
    summary: {
      totalMovements: 1,
      totalInbound: Number(isEntry),
      totalOutbound: Number(!isEntry),
      inboundUnits: isEntry ? 2 : 0,
      outboundUnits: isEntry ? 0 : 2,
      unitBalance: isEntry ? 2 : -2,
    },
    byProduct: [],
    movements: [{
      id,
      productId: 7,
      productName: 'Arroz',
      productCode: 'P007',
      type,
      date: '2026-11-07T10:00:00',
      quantity: 2,
      resultingStock: isEntry ? 12 : 8,
      observation,
    }],
  }
}

it('conserva el historial de los filtros nuevos si una actualización anterior termina después', async () => {
  const oldRefresh = deferredReport()
  const filteredRequest = deferredReport()
  getProducts.mockResolvedValue([])
  getInventoryReport.mockResolvedValue({
    summary: {
      totalProducts: 0,
      totalUnitsInStock: 0,
      productsWithNormalStock: 0,
      productsWithLowStock: 0,
      productsOutOfStock: 0,
    },
    products: [],
  })
  getMovementReport
    .mockResolvedValueOnce(movementReport(1, 'ENTRADA', 'Consulta inicial'))
    .mockReturnValueOnce(oldRefresh.promise)
    .mockReturnValueOnce(filteredRequest.promise)

  render(<ReportsPage />)
  expect(await screen.findByRole('cell', { name: 'Consulta inicial' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Actualizar reportes' }))
  expect(getMovementReport).toHaveBeenNthCalledWith(2, {})
  expect(screen.getByRole('button', { name: 'Actualizando...' }).disabled).toBe(true)

  fireEvent.click(screen.getByRole('button', { name: 'Tipo de movimiento' }))
  fireEvent.click(screen.getByRole('option', { name: 'Salidas' }))
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
  expect(getMovementReport).toHaveBeenNthCalledWith(3, { type: 'SALIDA' })

  await act(async () => {
    filteredRequest.resolve(movementReport(2, 'SALIDA', 'Consulta nueva: salida'))
  })
  expect(screen.getByText('Solo salidas')).toBeTruthy()
  expect(screen.getByRole('cell', { name: 'Consulta nueva: salida' })).toBeTruthy()

  await act(async () => {
    oldRefresh.resolve(movementReport(3, 'ENTRADA', 'Consulta anterior: entrada'))
  })
  expect(screen.getByRole('button', { name: 'Actualizar reportes' }).disabled).toBe(false)
  expect(screen.getByText('Solo salidas')).toBeTruthy()
  const observations = screen.getAllByRole('cell', { name: /^Consulta / })
  expect(observations.map((cell) => cell.textContent)).toEqual(['Consulta nueva: salida'])
})
