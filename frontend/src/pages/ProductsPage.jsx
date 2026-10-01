import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Filter,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { getCategories } from '../services/categoryService'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService'
import '../styles/pages/products.css'

// Administra productos, categorías, filtros locales y las operaciones de creación, edición y borrado.
function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
  const [minimumStock, setMinimumStock] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const codeInputRef = useRef(null)

  // Carga en paralelo el catálogo y las categorías necesarias para el formulario.
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

  // Clasifica el stock para los indicadores y filtros de la página.
  const getStockStatus = (product) => {
    if (product.currentStock === 0) {
      return 'OUT_OF_STOCK'
    }

    if (product.currentStock <= product.minimumStock) {
      return 'LOW_STOCK'
    }

    return 'NORMAL'
  }

  // Calcula los totales de unidades y productos por estado a partir del catálogo cargado.
  const stockSummary = useMemo(() => {
    return products.reduce(
      (summary, product) => {
        const status = getStockStatus(product)

        if (status === 'OUT_OF_STOCK') {
          summary.outOfStock += 1
        } else if (status === 'LOW_STOCK') {
          summary.lowStock += 1
        } else {
          summary.normal += 1
        }

        summary.totalUnits += product.currentStock

        return summary
      },
      {
        totalUnits: 0,
        normal: 0,
        lowStock: 0,
        outOfStock: 0,
      },
    )
  }, [products])

  // Combina la búsqueda textual con los filtros seleccionados de categoría y stock.
  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.code.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)

      const matchesCategory =
        !categoryFilter ||
        String(product.categoryId) === categoryFilter

      const matchesStock =
        !stockFilter || getStockStatus(product) === stockFilter

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, searchTerm, categoryFilter, stockFilter])

  const refreshProducts = async () => {
    const data = await getProducts()
    setProducts(data)
  }

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const resetForm = () => {
    setCode('')
    setName('')
    setCategoryId('')
    setUnitOfMeasure('')
    setMinimumStock('')
    setEditingId(null)
  }

  const focusForm = () => {
    requestAnimationFrame(() => {
      codeInputRef.current?.focus()
      codeInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  const handleNewProduct = () => {
    clearFeedback()
    resetForm()
    focusForm()
  }

  // Normaliza y valida los campos antes de crear o actualizar; luego sincroniza la lista.
  const handleSubmit = async (event) => {
    event.preventDefault()

    clearFeedback()

    const normalizedCode = code.trim()
    const normalizedName = name.trim()
    const normalizedUnit = unitOfMeasure.trim()

    if (
      !normalizedCode ||
      !normalizedName ||
      !categoryId ||
      !normalizedUnit ||
      minimumStock === ''
    ) {
      setError('Completa todos los campos del producto.')
      return
    }

    const product = {
      code: normalizedCode,
      name: normalizedName,
      categoryId: Number(categoryId),
      unitOfMeasure: normalizedUnit,
      minimumStock: Number(minimumStock),
    }

    try {
      setSaving(true)

      if (editingId) {
        await updateProduct(editingId, product)
        setMessage('Producto actualizado correctamente')
      } else {
        await createProduct(product)
        setMessage('Producto creado correctamente')
      }

      resetForm()
      await refreshProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible guardar el producto',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setCode(product.code)
    setName(product.name)
    setCategoryId(String(product.categoryId))
    setUnitOfMeasure(product.unitOfMeasure)
    setMinimumStock(String(product.minimumStock))

    clearFeedback()
    focusForm()
  }

  const handleCancelEdit = () => {
    resetForm()
    clearFeedback()
  }

  const handleDeleteRequest = (product) => {
    clearFeedback()
    setProductToDelete(product)
  }

  // Confirma el borrado y vuelve a cargar el catálogo para reflejar el resultado del backend.
  const handleDeleteConfirm = async () => {
    if (!productToDelete) {
      return
    }

    clearFeedback()

    try {
      setDeleting(true)

      const data = await deleteProduct(productToDelete.id)

      setMessage(
        data.message || 'Producto eliminado correctamente',
      )

      if (editingId === productToDelete.id) {
        resetForm()
      }

      setProductToDelete(null)
      await refreshProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible eliminar el producto',
      )

      setProductToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  // Restablece simultáneamente la búsqueda y los filtros activos.
  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setStockFilter('')
  }

  const hasActiveFilters =
    searchTerm || categoryFilter || stockFilter

  const getStatusLabel = (status) => {
    if (status === 'OUT_OF_STOCK') {
      return 'Sin stock'
    }

    if (status === 'LOW_STOCK') {
      return 'Bajo stock'
    }

    return 'Normal'
  }

  return (
    <>
      <div className="products-heading">
        <div className="products-title-row">
          <div className="products-title-icon">
            <Boxes size={23} />
          </div>

          <div>
            <h2 className="page-title">Productos</h2>
            <p className="page-subtitle">
              Administra los productos y controla su estado de inventario.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="products-new-button"
          onClick={handleNewProduct}
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      <section className="products-metrics">
        <article className="products-metric-card products-metric-total">
          <div className="products-metric-icon">
            <Package size={21} />
          </div>

          <div>
            <span>Productos</span>
            <strong>{products.length}</strong>
            <small>Registrados</small>
          </div>
        </article>

        <article className="products-metric-card products-metric-units">
          <div className="products-metric-icon">
            <Boxes size={21} />
          </div>

          <div>
            <span>Unidades</span>
            <strong>{stockSummary.totalUnits}</strong>
            <small>En inventario</small>
          </div>
        </article>

        <article className="products-metric-card products-metric-low">
          <div className="products-metric-icon">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Stock bajo</span>
            <strong>{stockSummary.lowStock}</strong>
            <small>Requieren atención</small>
          </div>
        </article>

        <article className="products-metric-card products-metric-out">
          <div className="products-metric-icon">
            <PackageX size={21} />
          </div>

          <div>
            <span>Sin stock</span>
            <strong>{stockSummary.outOfStock}</strong>
            <small>Sin unidades</small>
          </div>
        </article>
      </section>

      {(error || message) && (
        <div
          className={
            error
              ? 'products-feedback products-feedback-error'
              : 'products-feedback products-feedback-success'
          }
        >
          {error ? (
            <CircleAlert size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          <span>{error || message}</span>
        </div>
      )}

      <section className="products-form-panel">
        <div className="products-panel-heading">
          <div className="products-panel-icon">
            {editingId ? <Pencil size={19} /> : <Plus size={19} />}
          </div>

          <div>
            <h3>
              {editingId ? 'Editar producto' : 'Registrar producto'}
            </h3>

            <p>
              {editingId
                ? 'Actualiza la información del producto seleccionado.'
                : 'Completa la información para agregar un nuevo producto al inventario.'}
            </p>
          </div>

          {editingId && (
            <span className="products-editing-badge">
              Editando #{editingId}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="product-form-grid">
            <div className="form-group">
              <label htmlFor="code" className="form-label">
                Código
              </label>

              <input
                ref={codeInputRef}
                id="code"
                className="form-input products-form-input"
                type="text"
                placeholder="Ej. P001"
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
                className="form-input products-form-input"
                type="text"
                placeholder="Ej. Coca Cola 1.5L"
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
                className="form-input products-form-input"
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
                className="form-input products-form-input"
                type="text"
                placeholder="Ej. Unidad, Caja, Paquete"
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
                className="form-input products-form-input"
                type="number"
                min="0"
                placeholder="Ej. 5"
                value={minimumStock}
                onChange={(event) =>
                  setMinimumStock(event.target.value)
                }
                required
              />

              <span className="products-field-help">
                Define cuándo el sistema debe mostrar una alerta de stock.
              </span>
            </div>
          </div>

          <div className="products-form-actions">
            <button
              type="submit"
              className="products-save-button"
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
                  : 'Crear producto'}
            </button>

            {editingId && (
              <button
                type="button"
                className="products-cancel-button"
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

      <section className="products-list-panel">
        <div className="products-list-header">
          <div>
            <h3>Inventario de productos</h3>
            <p>
              Consulta el stock, filtra los productos y administra sus datos.
            </p>
          </div>

          <span className="products-count">
            {products.length}{' '}
            {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="products-toolbar">
          <div className="products-search">
            <Search size={17} />

            <input
              type="search"
              value={searchTerm}
              placeholder="Buscar por código, nombre o categoría..."
              aria-label="Buscar productos"
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="products-filter">
            <Filter size={16} />

            <select
              value={categoryFilter}
              aria-label="Filtrar por categoría"
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="">Todas las categorías</option>

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

          <div className="products-filter">
            <PackageCheck size={16} />

            <select
              value={stockFilter}
              aria-label="Filtrar por estado de stock"
              onChange={(event) =>
                setStockFilter(event.target.value)
              }
            >
              <option value="">Todos los estados</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW_STOCK">Bajo stock</option>
              <option value="OUT_OF_STOCK">Sin stock</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="products-clear-filters"
              onClick={clearFilters}
            >
              <X size={15} />
              Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="products-filter-summary">
            Mostrando {filteredProducts.length} de {products.length}{' '}
            productos.
          </div>
        )}

        <div className="products-table-container">
          {loading ? (
            <div className="products-state">
              <div className="products-spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-state products-empty">
              <div className="products-empty-icon">
                <Package size={26} />
              </div>

              <h4>
                {hasActiveFilters
                  ? 'No encontramos productos'
                  : 'No hay productos registrados'}
              </h4>

              <p>
                {hasActiveFilters
                  ? 'Prueba cambiando los filtros o el término de búsqueda.'
                  : 'Registra el primer producto para comenzar a controlar el inventario.'}
              </p>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                  <th className="products-actions-heading">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product)

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-row-icon">
                            <Package size={17} />
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <span>{product.code}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="product-category-badge">
                          {product.category}
                        </span>
                      </td>

                      <td>{product.unitOfMeasure}</td>

                      <td>
                        <strong
                          className={
                            status === 'OUT_OF_STOCK'
                              ? 'product-stock-number product-stock-out'
                              : status === 'LOW_STOCK'
                                ? 'product-stock-number product-stock-low'
                                : 'product-stock-number product-stock-normal'
                          }
                        >
                          {product.currentStock}
                        </strong>
                      </td>

                      <td>{product.minimumStock}</td>

                      <td>
                        <span
                          className={`product-status-badge product-status-${status.toLowerCase()}`}
                        >
                          {status === 'NORMAL' && (
                            <CheckCircle2 size={13} />
                          )}

                          {status === 'LOW_STOCK' && (
                            <AlertTriangle size={13} />
                          )}

                          {status === 'OUT_OF_STOCK' && (
                            <PackageX size={13} />
                          )}

                          {getStatusLabel(status)}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="product-action-button product-edit-button"
                            onClick={() => handleEdit(product)}
                            aria-label={`Editar ${product.name}`}
                            title="Editar producto"
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className="product-action-button product-delete-button"
                            onClick={() =>
                              handleDeleteRequest(product)
                            }
                            aria-label={`Eliminar ${product.name}`}
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {productToDelete && (
        <div
          className="product-modal-backdrop"
          role="presentation"
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
          >
            <div className="product-modal-danger-icon">
              <Trash2 size={23} />
            </div>

            <h3 id="delete-product-title">
              Eliminar producto
            </h3>

            <p>
              ¿Seguro que deseas eliminar{' '}
              <strong>{productToDelete.name}</strong>?
            </p>

            <span>
              Los productos con movimientos registrados no pueden
              eliminarse porque forman parte del historial del inventario.
            </span>

            <div className="product-modal-actions">
              <button
                type="button"
                className="product-modal-cancel"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="product-modal-delete"
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

export default ProductsPage
