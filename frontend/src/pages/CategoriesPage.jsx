import { useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible cargar las categorías',
      )
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
    let cancelled = false

    const fetchCategories = async () => {
        try {
        const data = await getCategories()

        if (!cancelled) {
            setCategories(data)
        }
        } catch (error) {
        if (!cancelled) {
            setError(
            error.response?.data?.message ||
                'No fue posible cargar las categorías',
            )
        }
        } finally {
        if (!cancelled) {
            setLoading(false)
        }
        }
    }

    fetchCategories()

    return () => {
        cancelled = true
    }
    }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    try {
      if (editingId) {
        await updateCategory(editingId, name)
        setMessage('Categoría actualizada correctamente')
      } else {
        await createCategory(name)
        setMessage('Categoría creada correctamente')
      }

      setName('')
      setEditingId(null)

      await loadCategories()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible guardar la categoría',
      )
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    setError('')
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar esta categoría?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      const data = await deleteCategory(id)

      setMessage(
        data.message || 'Categoría eliminada correctamente',
      )

      await loadCategories()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible eliminar la categoría',
      )
    }
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Categorías</h2>
        <p className="page-subtitle">
          Administra las categorías de los productos.
        </p>
      </div>

      <section className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              htmlFor="categoryName"
              className="form-label"
            >
              Nombre de la categoría
            </label>

            <input
              id="categoryName"
              className="form-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
            >
              {editingId ? 'Actualizar' : 'Crear categoría'}
            </button>

            {editingId && (
              <button
                type="button"
                className="button button-secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {error && <p className="message-error">{error}</p>}
        {message && (
          <p className="message-success">{message}</p>
        )}
      </section>

      <div className="table-container">
        {loading ? (
          <p>Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p>No hay categorías registradas.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>

                  <td className="actions-cell">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default CategoriesPage