import apiClient from '../api/apiClient'

/** Consulta el catálogo de productos mediante GET /api/products. */
const getProducts = async () => {
  const response = await apiClient.get('/api/products')
  return response.data
}

/** Registra un producto mediante POST /api/products. */
const createProduct = async (product) => {
  const response = await apiClient.post('/api/products', product)
  return response.data
}

/** Actualiza un producto mediante PUT /api/products/{id}. */
const updateProduct = async (id, product) => {
  const response = await apiClient.put(`/api/products/${id}`, product)
  return response.data
}

/** Elimina un producto mediante DELETE /api/products/{id}. */
const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/products/${id}`)
  return response.data
}

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}