import apiClient from '../api/apiClient'

/** Consulta las categorías mediante GET /api/categories. */
const getCategories = async () => {
  const response = await apiClient.get('/api/categories')
  return response.data
}

/** Crea una categoría mediante POST /api/categories. */
const createCategory = async (name) => {
  const response = await apiClient.post('/api/categories', {
    name,
  })

  return response.data
}

/** Actualiza una categoría mediante PUT /api/categories/{id}. */
const updateCategory = async (id, name) => {
  const response = await apiClient.put(`/api/categories/${id}`, {
    name,
  })

  return response.data
}

/** Elimina una categoría mediante DELETE /api/categories/{id}. */
const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/api/categories/${id}`)
  return response.data
}

export {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}