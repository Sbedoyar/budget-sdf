import apiClient from '../api/apiClient'

const getMovements = async () => {
  const response = await apiClient.get('/api/movements')
  return response.data
}

const getMovementsByProduct = async (productId) => {
  const response = await apiClient.get(
    `/api/movements/product/${productId}`,
  )

  return response.data
}

const createMovement = async (movement) => {
  const response = await apiClient.post('/api/movements', movement)
  return response.data
}

export {
  getMovements,
  getMovementsByProduct,
  createMovement,
}