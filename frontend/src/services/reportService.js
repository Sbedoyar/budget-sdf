import apiClient from '../api/apiClient'

/** Obtiene el resumen y detalle de inventario mediante GET /api/reports/inventory. */
const getInventoryReport = async () => {
  const response = await apiClient.get('/api/reports/inventory')
  return response.data
}

/** Obtiene los totales y el historial de movimientos mediante GET /api/reports/movements. */
const getMovementReport = async () => {
  const response = await apiClient.get('/api/reports/movements')
  return response.data
}

export {
  getInventoryReport,
  getMovementReport,
}