import { getErrorMessage } from '../utils/getErrorMessage'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  FolderOpen,
  Pencil,
  Plus,
  Save,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import '../styles/pages/categories.css'

// Administra el ciclo CRUD de categorías, su búsqueda local y los estados de carga y feedback.
function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const nameInputRef = useRef(null)

  // Carga las categorías al entrar y evita actualizar el estado si la página ya se desmontó.
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
            getErrorMessage(error, 'No fue posible cargar las categorías'),
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

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return categories
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    )
  }, [categories, searchTerm])

  // Vuelve a consultar el endpoint después de una operación que modifica el catálogo.
  const refreshCategories = async () => {
    const data = await getCategories()
    setCategories(data)
  }

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
  }

  const handleNewCategory = () => {
    clearFeedback()
    resetForm()

    requestAnimationFrame(() => {
      nameInputRef.current?.focus()
    })
  }

  // Valida el nombre y decide entre crear o actualizar según el identificador en edición.
  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedName = name.trim()

    clearFeedback()

    if (!normalizedName) {
      setError('Ingresa el nombre de la categoría.')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await updateCategory(editingId, normalizedName)
        setMessage('Categoría actualizada correctamente')
      } else {
        await createCategory(normalizedName)
        setMessage('Categoría creada correctamente')
      }

      resetForm()
      await refreshCategories()
    } catch (error) {
      setError(
        getErrorMessage(error, 'No fue posible guardar la categoría'),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    clearFeedback()

    requestAnimationFrame(() => {
      nameInputRef.current?.focus()
    })
  }

  const handleCancelEdit = () => {
    resetForm()
    clearFeedback()
  }

  const handleDeleteRequest = (category) => {
    clearFeedback()
    setCategoryToDelete(category)
  }

  // Confirma el borrado, actualiza el listado y muestra el resultado de la operación.
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) {
      return
    }

    clearFeedback()

    try {
      setDeleting(true)

      const data = await deleteCategory(categoryToDelete.id)

      setMessage(
        data.message || 'Categoría eliminada correctamente',
      )

      if (editingId === categoryToDelete.id) {
        resetForm()
      }

      setCategoryToDelete(null)
      await refreshCategories()
    } catch (error) {
      setError(
        getErrorMessage(error, 'No fue posible eliminar la categoría'),
      )

      setCategoryToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="categories-heading">
        <div>
          <div className="categories-title-row">
            <div className="categories-title-icon">
              <Tags size={22} />
            </div>

            <div>
              <h2 className="page-title">Categorías</h2>
              <p className="page-subtitle">
                Organiza las categorías utilizadas por tus productos.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="categories-new-button"
          onClick={handleNewCategory}
        >
          <Plus size={18} />
          Nueva categoría
        </button>
      </div>

      <section className="categories-summary">
        <div className="categories-summary-icon">
          <FolderOpen size={22} />
        </div>

        <div>
          <span>Categorías registradas</span>
          <strong>{categories.length}</strong>
        </div>

        <p>
          Clasifica los productos para mantener el inventario
          organizado y fácil de consultar.
        </p>
      </section>

      {(error || message) && (
        <div
          className={
            error
              ? 'categories-feedback categories-feedback-error'
              : 'categories-feedback categories-feedback-success'
          }
        >
          <CheckCircle2 size={18} />
          <span>{error || message}</span>
        </div>
      )}

      <div className="categories-layout">
        <section className="categories-form-panel">
          <div className="categories-panel-heading">
            <div className="categories-panel-icon">
              {editingId ? <Pencil size={19} /> : <Plus size={19} />}
            </div>

            <div>
              <h3>
                {editingId
                  ? 'Editar categoría'
                  : 'Nueva categoría'}
              </h3>

              <p>
                {editingId
                  ? 'Actualiza el nombre de la categoría seleccionada.'
                  : 'Crea una nueva categoría para organizar tus productos.'}
              </p>
            </div>
          </div>

          {editingId && (
            <div className="categories-editing-notice">
              <Pencil size={15} />
              Editando categoría #{editingId}
            </div>
          )}

          <form
            className="categories-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label
                htmlFor="categoryName"
                className="form-label"
              >
                Nombre de la categoría
              </label>

              <input
                ref={nameInputRef}
                id="categoryName"
                className="form-input categories-name-input"
                type="text"
                value={name}
                placeholder="Ej. Bebidas"
                onChange={(event) => setName(event.target.value)}
                required
              />

              <span className="categories-field-help">
                Utiliza un nombre corto y fácil de identificar.
              </span>
            </div>

            <div className="categories-form-actions">
              <button
                type="submit"
                className="categories-save-button"
                disabled={saving}
              >
                {editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="categories-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="categories-list-panel">
          <div className="categories-list-header">
            <div>
              <h3>Listado de categorías</h3>
              <p>
                Consulta, edita o elimina las categorías registradas.
              </p>
            </div>

            <span className="categories-count">
              {categories.length}{' '}
              {categories.length === 1
                ? 'categoría'
                : 'categorías'}
            </span>
          </div>

          <div className="categories-toolbar">
            <div className="categories-search">
              <Search size={17} />

              <input
                type="search"
                value={searchTerm}
                placeholder="Buscar categoría..."
                aria-label="Buscar categoría"
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            {searchTerm && (
              <span className="categories-results">
                {filteredCategories.length}{' '}
                {filteredCategories.length === 1
                  ? 'resultado'
                  : 'resultados'}
              </span>
            )}
          </div>

          <div className="categories-table-container">
            {loading ? (
              <div className="categories-state">
                <div className="categories-spinner" />
                <p>Cargando categorías...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="categories-state categories-empty">
                <div className="categories-empty-icon">
                  <FolderOpen size={25} />
                </div>

                <h4>
                  {searchTerm
                    ? 'No encontramos categorías'
                    : 'No hay categorías registradas'}
                </h4>

                <p>
                  {searchTerm
                    ? 'Prueba con otro término de búsqueda.'
                    : 'Crea la primera categoría para comenzar a organizar tus productos.'}
                </p>
              </div>
            ) : (
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>ID</th>
                    <th className="categories-actions-heading">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-row-icon">
                            <FolderOpen size={17} />
                          </div>

                          <div>
                            <strong>{category.name}</strong>
                            <span>Categoría de productos</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="category-id-badge">
                          #{category.id}
                        </span>
                      </td>

                      <td>
                        <div className="category-actions">
                          <button
                            type="button"
                            className="category-action-button category-edit-button"
                            onClick={() => handleEdit(category)}
                            aria-label={`Editar ${category.name}`}
                            title="Editar categoría"
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className="category-action-button category-delete-button"
                            onClick={() =>
                              handleDeleteRequest(category)
                            }
                            aria-label={`Eliminar ${category.name}`}
                            title="Eliminar categoría"
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {categoryToDelete && (
        <div
          className="category-modal-backdrop"
          role="presentation"
        >
          <div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
          >
            <div className="category-modal-danger-icon">
              <Trash2 size={22} />
            </div>

            <h3 id="delete-category-title">
              Eliminar categoría
            </h3>

            <p>
              ¿Seguro que deseas eliminar{' '}
              <strong>{categoryToDelete.name}</strong>?
            </p>

            <span>
              Esta acción solo se completará si la categoría no
              tiene productos asociados.
            </span>

            <div className="category-modal-actions">
              <button
                type="button"
                className="category-modal-cancel"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="category-modal-delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                <Trash2 size={16} />
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CategoriesPage