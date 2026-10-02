import apiClient from '../api/apiClient'

/**
 * Obtiene el reporte actual del inventario.
 *
 * @returns {Promise<Object>} reporte consolidado del inventario
 */
const getInventoryReport = async () => {
  const response = await apiClient.get('/api/reports/inventory')

  return response.data
}

/**
 * Obtiene el reporte de movimientos aplicando filtros opcionales.
 *
 * Los filtros disponibles son:
 * - from: fecha inicial en formato YYYY-MM-DD
 * - to: fecha final en formato YYYY-MM-DD
 * - type: ENTRADA o SALIDA
 * - productIds: identificadores de varios productos
 *
 * También mantiene compatibilidad temporal con productId
 * mientras la interfaz termina de migrar al selector múltiple.
 *
 * @param {Object} filters filtros opcionales del reporte
 * @returns {Promise<Object>} reporte de movimientos
 */
const getMovementReport = async (filters = {}) => {
  const params = {}

  if (filters.from) {
    params.from = filters.from
  }

  if (filters.to) {
    params.to = filters.to
  }

  if (filters.type) {
    params.type = filters.type
  }

  if (
    Array.isArray(filters.productIds) &&
    filters.productIds.length > 0
  ) {
    params.productIds = filters.productIds.join(',')
  } else if (filters.productId) {
    /*
     * Compatibilidad temporal con el selector anterior,
     * que enviaba un único identificador de producto.
     */
    params.productIds = String(filters.productId)
  }

  const response = await apiClient.get(
    '/api/reports/movements',
    {
      params,
    },
  )

  return response.data
}

export {
  getInventoryReport,
  getMovementReport,
}