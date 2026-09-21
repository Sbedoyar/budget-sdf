import { useEffect, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService'
import { getCategories } from '../services/categoryService'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
  const [minimumStock, setMinimumStock] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible cargar los productos',
      )
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
        let cancelled = false

        const fetchInitialData = async () => {
            try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ])

            if (!cancelled) {
                setProducts(productsData)
                setCategories(categoriesData)
            }
            } catch (error) {
            if (!cancelled) {
                setError(
                error.response?.data?.message ||
                    'No fue posible cargar los datos',
                )
            }
            } finally {
            if (!cancelled) {
                setLoading(false)
            }
            }
        }

        fetchInitialData()

        return () => {
            cancelled = true
        }
        }, [])

  const resetForm = () => {
    setCode('')
    setName('')
    setCategoryId('')
    setUnitOfMeasure('')
    setMinimumStock('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    const product = {
      code,
      name,
      categoryId: Number(categoryId),
      unitOfMeasure,
      minimumStock: Number(minimumStock),
    }

    try {
      if (editingId) {
        await updateProduct(editingId, product)
        setMessage('Producto actualizado correctamente')
      } else {
        await createProduct(product)
        setMessage('Producto creado correctamente')
      }

      resetForm()
      await loadProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible guardar el producto',
      )
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setCode(product.code)
    setName(product.name)
    setCategoryId(String(product.categoryId))
    setUnitOfMeasure(product.unitOfMeasure)
    setMinimumStock(String(product.minimumStock))

    setError('')
    setMessage('')
  }

  const handleCancelEdit = () => {
    resetForm()
    setError('')
    setMessage('')
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este producto?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      const data = await deleteProduct(id)

      setMessage(
        data.message || 'Producto eliminado correctamente',
      )

      await loadProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible eliminar el producto',
      )
    }
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Productos</h2>

        <p className="page-subtitle">
          Administra los productos del inventario.
        </p>
      </div>

      <section className="card">
        <form onSubmit={handleSubmit}>
          <div className="product-form-grid">
            <div className="form-group">
              <label htmlFor="code" className="form-label">
                Código
              </label>

              <input
                id="code"
                className="form-input"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre
              </label>

              <input
                id="name"
                className="form-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Categoría
              </label>

              <select
                id="category"
                className="form-input"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="unitOfMeasure"
                className="form-label"
              >
                Unidad de medida
              </label>

              <input
                id="unitOfMeasure"
                className="form-input"
                type="text"
                placeholder="Ej: Unidad, Caja, Paquete"
                value={unitOfMeasure}
                onChange={(event) =>
                  setUnitOfMeasure(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="minimumStock"
                className="form-label"
              >
                Stock mínimo
              </label>

              <input
                id="minimumStock"
                className="form-input"
                type="number"
                min="0"
                value={minimumStock}
                onChange={(event) =>
                  setMinimumStock(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
            >
              {editingId ? 'Actualizar producto' : 'Crear producto'}
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
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.unitOfMeasure}</td>
                  <td>{product.currentStock}</td>
                  <td>{product.minimumStock}</td>

                  <td className="actions-cell">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDelete(product.id)}
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

export default ProductsPage