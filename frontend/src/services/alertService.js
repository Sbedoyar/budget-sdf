import apiClient from '../api/apiClient'

/** Consulta las alertas de stock bajo mediante GET /api/alerts/low-stock. */
const getLowStockAlerts = async () => {
  const response = await apiClient.get('/api/alerts/low-stock')
  return response.data
}

export { getLowStockAlerts }