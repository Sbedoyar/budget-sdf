import apiClient from '../api/apiClient'

const getCategories = async () => {
  const response = await apiClient.get('/api/categories')
  return response.data
}

const createCategory = async (name) => {
  const response = await apiClient.post('/api/categories', {
    name,
  })

  return response.data
}

const updateCategory = async (id, name) => {
  const response = await apiClient.put(`/api/categories/${id}`, {
    name,
  })

  return response.data
}

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