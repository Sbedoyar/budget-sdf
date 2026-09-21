import apiClient from '../api/apiClient'

const getProducts = async () => {
  const response = await apiClient.get('/api/products')
  return response.data
}

const createProduct = async (product) => {
  const response = await apiClient.post('/api/products', product)
  return response.data
}

const updateProduct = async (id, product) => {
  const response = await apiClient.put(`/api/products/${id}`, product)
  return response.data
}

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