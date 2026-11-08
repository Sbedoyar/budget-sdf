// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getProducts } from '../services/productService'
import { getInventoryReport, getMovementReport } from '../services/reportService'
import { exportReportsToExcel } from '../utils/reportExcelExporter'
import ReportsPage from './ReportsPage'

vi.mock('../services/productService', () => ({ getProducts: vi.fn() }))
vi.mock('../services/reportService', () => ({
  getInventoryReport: vi.fn(),
  getMovementReport: vi.fn(),
}))
vi.mock('../utils/reportExcelExporter', () => ({ exportReportsToExcel: vi.fn() }))

const inventoryReport = {
  summary: {
    totalProducts: 0,
    totalUnitsInStock: 0,
    productsWithNormalStock: 0,
    productsWithLowStock: 0,
    productsOutOfStock: 0,
  },
  products: [],
}

const productCatalog = [{ id: 7, code: 'P007', name: 'Arroz', active: true }]

beforeEach(() => {
  getProducts.mockResolvedValue(productCatalog)
  getInventoryReport.mockResolvedValue(inventoryReport)
  exportReportsToExcel.mockResolvedValue(undefined)
})

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

function selectMovementType(label) {
  fireEvent.click(screen.getByRole('button', { name: 'Tipo de movimiento' }))
  fireEvent.click(screen.getByRole('option', { name: label }))
}

it('conserva el historial de los filtros nuevos si una actualización anterior termina después', async () => {
  const oldRefresh = deferredReport()
  const filteredRequest = deferredReport()
  getMovementReport
    .mockResolvedValueOnce(movementReport(1, 'ENTRADA', 'Consulta inicial'))
    .mockReturnValueOnce(oldRefresh.promise)
    .mockReturnValueOnce(filteredRequest.promise)

  render(<ReportsPage />)
  expect(await screen.findByRole('cell', { name: 'Consulta inicial' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Actualizar reportes' }))
  expect(getMovementReport).toHaveBeenNthCalledWith(2, {})
  expect(screen.getByRole('button', { name: 'Actualizando...' }).disabled).toBe(true)

  selectMovementType('Salidas')
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

it('exporta la vista actual con los filtros aplicados aunque el borrador haya cambiado', async () => {
  const filteredReport = movementReport(2, 'SALIDA', 'Salida filtrada')
  const pendingExport = deferredReport()
  getMovementReport
    .mockResolvedValueOnce(movementReport(1, 'ENTRADA', 'Consulta inicial'))
    .mockResolvedValueOnce(filteredReport)
  exportReportsToExcel.mockReturnValueOnce(pendingExport.promise)

  render(<ReportsPage />)
  await screen.findByRole('cell', { name: 'Consulta inicial' })
  selectMovementType('Salidas')
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
  await screen.findByRole('cell', { name: 'Salida filtrada' })
  selectMovementType('Entradas')

  const toggle = screen.getByRole('button', { name: 'Exportar Excel' })
  const menuName = 'Opciones de exportación a Excel'
  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('menu', { name: menuName })).toBeTruthy()
  fireEvent.keyDown(toggle, { key: 'Escape' })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByRole('menu', { name: menuName })).toBeNull()

  fireEvent.click(toggle)
  fireEvent.mouseDown(screen.getByRole('heading', { name: 'Reportes', exact: true }))
  expect(screen.queryByRole('menu', { name: menuName })).toBeNull()
  fireEvent.click(toggle)
  fireEvent.click(screen.getByRole('menuitem', { name: /Exportar vista actual/ }))

  expect(exportReportsToExcel).toHaveBeenCalledExactlyOnceWith({
    inventoryReport,
    movementReport: filteredReport,
    productCatalog,
    filters: { period: 'all', from: '', to: '', type: 'SALIDA', productIds: [] },
    mode: 'filtered',
  })
  expect(getMovementReport).toHaveBeenNthCalledWith(2, { type: 'SALIDA' })
  expect(getMovementReport).toHaveBeenCalledTimes(2)
  expect(getInventoryReport).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('menu', { name: menuName })).toBeNull()
  expect(screen.getByRole('button', { name: 'Generando Excel...' }).disabled).toBe(true)
  expect(screen.getByRole('button', { name: 'Actualizar reportes' }).disabled).toBe(true)

  await act(async () => pendingExport.resolve())
  expect(screen.getByText('La vista actual se exportó correctamente a Excel.')).toBeTruthy()
  expect(toggle.disabled).toBe(false)
})

it('vuelve a consultar los reportes sin filtros para exportar el reporte completo', async () => {
  const completeInventory = { ...inventoryReport }
  const completeReport = movementReport(3, 'ENTRADA', 'Entrada del reporte completo')
  getInventoryReport.mockResolvedValueOnce(inventoryReport).mockResolvedValueOnce(completeInventory)
  getMovementReport
    .mockResolvedValueOnce(movementReport(1, 'ENTRADA', 'Consulta inicial'))
    .mockResolvedValueOnce(movementReport(2, 'SALIDA', 'Salida filtrada'))
    .mockResolvedValueOnce(completeReport)

  render(<ReportsPage />)
  await screen.findByRole('cell', { name: 'Consulta inicial' })
  selectMovementType('Salidas')
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
  await screen.findByRole('cell', { name: 'Salida filtrada' })

  fireEvent.click(screen.getByRole('button', { name: 'Exportar Excel' }))
  fireEvent.click(screen.getByRole('menuitem', { name: /Exportar reporte completo/ }))
  expect(await screen.findByText('El reporte completo se exportó correctamente a Excel.')).toBeTruthy()

  expect(getInventoryReport.mock.calls).toEqual([[], []])
  expect(getMovementReport.mock.calls).toEqual([[], [{ type: 'SALIDA' }], []])
  expect(exportReportsToExcel).toHaveBeenCalledExactlyOnceWith({
    inventoryReport: completeInventory,
    movementReport: completeReport,
    productCatalog,
    filters: { period: 'all', from: '', to: '', type: '', productIds: [] },
    mode: 'full',
  })
  expect(exportReportsToExcel.mock.calls[0][0].inventoryReport).toBe(completeInventory)
  expect(screen.getByRole('cell', { name: 'Salida filtrada' })).toBeTruthy()
})
