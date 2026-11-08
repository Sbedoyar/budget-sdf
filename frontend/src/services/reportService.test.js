import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '../api/apiClient'
import { getInventoryReport, getMovementReport } from './reportService'

vi.mock('../api/apiClient', () => ({
  default: { get: vi.fn() },
}))

beforeEach(() => {
  apiClient.get.mockReset()
})

describe('reportService', () => {
  it('consulta el inventario sin filtros y devuelve los datos de la respuesta', async () => {
    const report = { summary: { totalProducts: 0 }, products: [] }
    apiClient.get.mockResolvedValue({ data: report })

    await expect(getInventoryReport()).resolves.toBe(report)
    expect(apiClient.get).toHaveBeenCalledExactlyOnceWith('/api/reports/inventory')
  })

  it.each([
    ['omitidos', undefined],
    ['vacíos', { from: '', to: '', type: '', productIds: [] }],
  ])('consulta movimientos sin parámetros cuando los filtros están %s', async (_, filters) => {
    apiClient.get.mockResolvedValue({ data: { movements: [] } })

    await getMovementReport(filters)
    expect(apiClient.get).toHaveBeenCalledExactlyOnceWith('/api/reports/movements', { params: {} })
  })

  it('envía fechas, tipo y una lista de IDs separada por comas con prioridad sobre productId', async () => {
    const report = { movements: [{ id: 1 }] }
    apiClient.get.mockResolvedValue({ data: report })

    await expect(getMovementReport({
      from: '2026-11-01',
      to: '2026-11-07',
      type: 'SALIDA',
      productIds: [7, '12'],
      productId: 99,
    })).resolves.toBe(report)

    expect(apiClient.get).toHaveBeenCalledExactlyOnceWith('/api/reports/movements', {
      params: { from: '2026-11-01', to: '2026-11-07', type: 'SALIDA', productIds: '7,12' },
    })
  })

  it.each([
    { productId: 7 },
    { productId: 7, productIds: [] },
  ])('envía el productId anterior como productIds cuando no hay lista: %j', async (filters) => {
    apiClient.get.mockResolvedValue({ data: { movements: [] } })

    await getMovementReport(filters)
    expect(apiClient.get).toHaveBeenCalledExactlyOnceWith('/api/reports/movements', {
      params: { productIds: '7' },
    })
  })

  it.each([
    ['inventario', getInventoryReport],
    ['movimientos', getMovementReport],
  ])('propaga el error HTTP del reporte de %s', async (_, getReport) => {
    const failure = { response: { status: 500, data: { message: 'Error de reporte' } } }
    apiClient.get.mockRejectedValue(failure)

    await expect(getReport()).rejects.toBe(failure)
  })
})
