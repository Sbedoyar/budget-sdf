import apiClient from '../api/apiClient'

const getInventoryReport = async () => {
  const response = await apiClient.get('/api/reports/inventory')
  return response.data
}

const getMovementReport = async () => {
  const response = await apiClient.get('/api/reports/movements')
  return response.data
}

export {
  getInventoryReport,
  getMovementReport,
}