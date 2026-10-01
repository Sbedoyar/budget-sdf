import apiClient from '../api/apiClient'

/** Consulta el historial general mediante GET /api/movements. */
const getMovements = async () => {
  const response = await apiClient.get('/api/movements')
  return response.data
}

/** Consulta los movimientos de un producto mediante GET /api/movements/product/{productId}. */
const getMovementsByProduct = async (productId) => {
  const response = await apiClient.get(
    `/api/movements/product/${productId}`,
  )

  return response.data
}

/** Registra una entrada o salida mediante POST /api/movements. */
const createMovement = async (movement) => {
  const response = await apiClient.post('/api/movements', movement)
  return response.data
}

export {
  getMovements,
  getMovementsByProduct,
  createMovement,
}