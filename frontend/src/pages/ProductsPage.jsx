import { getErrorMessage } from '../utils/getErrorMessage'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Filter,
  Package,
  PackageCheck,
  PackageX,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import AppSelect from '../components/AppSelect'
import ProductForm from '../components/ProductForm'
import ProductRetireDialog from '../components/ProductRetireDialog'
import ProductsTable from '../components/ProductsTable'
import { initialProductFormState, productFormReducer } from '../reducers/productFormReducer'
import { initialProductFiltersState, productFiltersReducer } from '../reducers/productFiltersReducer'
import { getCategories } from '../services/categoryService'
import {
  createProduct,
  deleteProduct,
  getProducts,
  reactivateProduct,
  updateProduct,
} from '../services/productService'
import '../styles/pages/products.css'

// Administra productos, categorías, filtros locales y las operaciones de creación, edición y borrado.
function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [form, dispatchForm] = useReducer(productFormReducer, initialProductFormState)
  const { code, name, categoryId, unitOfMeasure, minimumStock, editingId } = form
  const [productToDelete, setProductToDelete] = useState(null)

  const [filters, dispatchFilters] = useReducer(productFiltersReducer, initialProductFiltersState)
  const { searchTerm, categoryFilter, stockFilter, activityFilter } = filters

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reactivatingId, setReactivatingId] = useState(null)

  const codeInputRef = useRef(null)

  // Carga en paralelo el catálogo y las categorías necesarias para el formulario.
  useEffect(() => {
    let cancelled = false

    const fetchInitialData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(true),
          getCategories(),
        ])

        if (!cancelled) {
          setProducts(productsData)
          setCategories(categoriesData)
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            getErrorMessage(error, 'No fue posible cargar los datos'),
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

  // Mantiene separados los productos activos de los registros históricos inactivos.
  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false),
    [products],
  )

  const inactiveProductsCount = products.length - activeProducts.length

  // Calcula los totales de inventario únicamente con productos activos.
  const stockSummary = useMemo(() => {
    return activeProducts.reduce(
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
  }, [activeProducts])

  // Combina la búsqueda textual con los filtros seleccionados de categoría, stock y actividad.
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

      const matchesActivity =
        activityFilter === 'ALL' ||
        (activityFilter === 'ACTIVE' && product.active !== false) ||
        (activityFilter === 'INACTIVE' && product.active === false)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesActivity
      )
    })
  }, [
    products,
    searchTerm,
    categoryFilter,
    stockFilter,
    activityFilter,
  ])

  const refreshProducts = async () => {
    const data = await getProducts(true)
    setProducts(data)
  }

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const resetForm = () => {
    dispatchForm({ type: 'RESET_FORM' })
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

  const handleFieldChange = (field, value) => {
    dispatchForm({ type: 'SET_FIELD', field, value })
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
        getErrorMessage(error, 'No fue posible guardar el producto'),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    dispatchForm({ type: 'LOAD_PRODUCT', product })

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

  const handleDeleteCancel = () => {
    setProductToDelete(null)
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
        getErrorMessage(error, 'No fue posible eliminar el producto'),
      )

      setProductToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  // Reactiva un producto desactivado y vuelve a sincronizar el catálogo.
  const handleReactivate = async (product) => {
    clearFeedback()

    try {
      setReactivatingId(product.id)

      await reactivateProduct(product.id)

      setMessage(`${product.name} fue reactivado correctamente`)
      await refreshProducts()
    } catch (error) {
      setError(
        getErrorMessage(error, 'No fue posible reactivar el producto'),
      )
    } finally {
      setReactivatingId(null)
    }
  }

  // Restablece simultáneamente la búsqueda y los filtros activos.
  const clearFilters = () => {
    dispatchFilters({ type: 'RESET_FILTERS' })
  }

  const hasActiveFilters =
    searchTerm ||
    categoryFilter ||
    stockFilter ||
    activityFilter !== 'ACTIVE'

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
            <span>Productos activos</span>
            <strong>{activeProducts.length}</strong>
            <small>
              {inactiveProductsCount > 0
                ? `${inactiveProductsCount} inactivos`
                : 'Disponibles'}
            </small>
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

      <ProductForm
        form={form}
        categories={categories}
        saving={saving}
        codeInputRef={codeInputRef}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
      />

      <section className="products-list-panel">
        <div className="products-list-header">
          <div>
            <h3>Inventario de productos</h3>
            <p>
              Consulta activos e inactivos, filtra el catálogo y administra sus datos.
            </p>
          </div>

          <span className="products-count">
            {activeProducts.length}{' '}
            {activeProducts.length === 1 ? 'activo' : 'activos'}
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
                dispatchFilters({ type: 'SET_FILTER', field: 'searchTerm', value: event.target.value })
              }
            />
          </div>

          <div className="products-filter">
            <Filter size={16} />

            <AppSelect
              value={categoryFilter}
              aria-label="Filtrar por categoría"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'categoryFilter', value: event.target.value })
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
            </AppSelect>
          </div>

          <div className="products-filter">
            <PackageCheck size={16} />

            <AppSelect
              value={stockFilter}
              aria-label="Filtrar por estado de stock"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'stockFilter', value: event.target.value })
              }
            >
              <option value="">Todos los estados</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW_STOCK">Bajo stock</option>
              <option value="OUT_OF_STOCK">Sin stock</option>
            </AppSelect>
          </div>

          <div className="products-filter">
            <RotateCcw size={16} />

            <AppSelect
              value={activityFilter}
              aria-label="Filtrar por estado del producto"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'activityFilter', value: event.target.value })
              }
            >
              <option value="ACTIVE">Productos activos</option>
              <option value="INACTIVE">Productos inactivos</option>
              <option value="ALL">Activos e inactivos</option>
            </AppSelect>
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

        <ProductsTable
          products={filteredProducts}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          getStockStatus={getStockStatus}
          reactivatingId={reactivatingId}
          onEdit={handleEdit}
          onRetire={handleDeleteRequest}
          onReactivate={handleReactivate}
        />
      </section>

      {productToDelete && (
        <ProductRetireDialog
          productName={productToDelete.name}
          deleting={deleting}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  )
}

export default ProductsPage
