import apiClient from '../api/apiClient'

const getLowStockAlerts = async () => {
  const response = await apiClient.get('/api/alerts/low-stock')
  return response.data
}

export { getLowStockAlerts }