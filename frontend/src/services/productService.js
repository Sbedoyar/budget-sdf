import apiClient from '../api/apiClient'

/**
 * Consulta el catálogo de productos.
 *
 * Por defecto devuelve únicamente productos activos. Cuando
 * includeInactive es verdadero, también incluye los productos
 * desactivados para tareas administrativas e históricas.
 */
const getProducts = async (includeInactive = false) => {
  const response = await apiClient.get('/api/products', {
    params: includeInactive ? { includeInactive: true } : {},
  })

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

/**
 * Retira un producto del catálogo.
 * El backend lo elimina físicamente si no tiene movimientos o lo
 * desactiva cuando debe conservarse su historial.
 */
const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/products/${id}`)
  return response.data
}

/** Reactiva un producto previamente desactivado. */
const reactivateProduct = async (id) => {
  const response = await apiClient.patch(`/api/products/${id}/reactivate`)
  return response.data
}

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
}
