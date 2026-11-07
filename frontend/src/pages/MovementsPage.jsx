import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Filter,
  History,
  Package,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Warehouse,
  X,
} from 'lucide-react'
import {
  createMovement,
  getMovements,
} from '../services/movementService'
import AppSelect from '../components/AppSelect'
import {
  initialMovementFormState,
  movementFormReducer,
} from '../reducers/movementFormReducer'
import {
  initialMovementFiltersState,
  movementFiltersReducer,
} from '../reducers/movementFiltersReducer'
import { getProducts } from '../services/productService'
import '../styles/pages/movements.css'

// Registra entradas y salidas, muestra una vista previa del stock y permite consultar el historial.
function MovementsPage() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [historyProducts, setHistoryProducts] = useState([])

  const [form, dispatchForm] = useReducer(
    movementFormReducer,
    initialMovementFormState,
  )
  const { productId, type, quantity, observation } = form

  const [filters, dispatchFilters] = useReducer(
    movementFiltersReducer,
    initialMovementFiltersState,
  )
  const { searchTerm, typeFilter, productFilter } = filters

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const productSelectRef = useRef(null)

  // Obtiene en paralelo el historial y el catálogo requerido para seleccionar productos.
  useEffect(() => {
    let cancelled = false

    const fetchInitialData = async () => {
      try {
        const [
          movementsData,
          productsData,
          historyProductsData,
        ] = await Promise.all([
          getMovements(),
          getProducts(),
          getProducts(true),
        ])

        if (!cancelled) {
          setMovements(movementsData)
          setProducts(productsData)
          setHistoryProducts(historyProductsData)
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

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => product.id === Number(productId),
      ),
    [products, productId],
  )

  // Resume cantidad de operaciones y unidades recibidas o retiradas.
  const movementSummary = useMemo(() => {
    return movements.reduce(
      (summary, movement) => {
        summary.totalMovements += 1

        if (movement.type === 'ENTRADA') {
          summary.entries += 1
          summary.entryUnits += movement.quantity
        } else if (movement.type === 'SALIDA') {
          summary.exits += 1
          summary.exitUnits += movement.quantity
        }

        return summary
      },
      {
        totalMovements: 0,
        entries: 0,
        exits: 0,
        entryUnits: 0,
        exitUnits: 0,
      },
    )
  }, [movements])

  // Filtra el historial por producto/observación, tipo y producto seleccionado.
  const filteredMovements = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return movements.filter((movement) => {
      const observation = movement.observation || ''

      const matchesSearch =
        !query ||
        movement.productName.toLowerCase().includes(query) ||
        observation.toLowerCase().includes(query)

      const matchesType =
        !typeFilter || movement.type === typeFilter

      const matchesProduct =
        !productFilter ||
        String(movement.productId) === productFilter

      return matchesSearch && matchesType && matchesProduct
    })
  }, [movements, searchTerm, typeFilter, productFilter])

  // Calcula en el cliente el stock resultante y detecta salidas superiores al disponible.
  const requestedQuantity = Number(quantity || 0)

  const exceedsAvailableStock =
    type === 'SALIDA' &&
    selectedProduct &&
    requestedQuantity > selectedProduct.currentStock

  const resultingStockPreview =
    selectedProduct && requestedQuantity > 0
      ? type === 'ENTRADA'
        ? selectedProduct.currentStock + requestedQuantity
        : type === 'SALIDA'
          ? selectedProduct.currentStock - requestedQuantity
          : selectedProduct.currentStock
      : selectedProduct?.currentStock

  // Sincroniza movimientos y productos luego de registrar una operación.
  const refreshData = async () => {
    const [
      movementsData,
      productsData,
      historyProductsData,
    ] = await Promise.all([
      getMovements(),
      getProducts(),
      getProducts(true),
    ])

    setMovements(movementsData)
    setProducts(productsData)
    setHistoryProducts(historyProductsData)
  }

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const resetForm = () => {
    dispatchForm({ type: 'RESET_FORM' })
  }

  const handleNewMovement = () => {
    clearFeedback()
    resetForm()

    requestAnimationFrame(() => {
      productSelectRef.current?.focus()
      productSelectRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  // Valida los datos y el stock antes de enviar el movimiento al backend.
  const handleSubmit = async (event) => {
    event.preventDefault()

    clearFeedback()

    if (
      !productId ||
      !type ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      setError('Completa los datos requeridos del movimiento.')
      return
    }

    if (exceedsAvailableStock) {
      setError(
        `La salida supera el stock disponible (${selectedProduct.currentStock}).`,
      )
      return
    }

    const movement = {
      productId: Number(productId),
      type,
      quantity: Number(quantity),
      observation: observation.trim(),
    }

    try {
      setSaving(true)

      const data = await createMovement(movement)

      setMessage(
        `Movimiento registrado correctamente. Stock resultante: ${data.resultingStock}`,
      )

      resetForm()
      await refreshData()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible registrar el movimiento',
      )
    } finally {
      setSaving(false)
    }
  }

  // Limpia simultáneamente los criterios aplicados al historial.
  const clearFilters = () => {
    dispatchFilters({ type: 'RESET_FILTERS' })
  }

  const hasActiveFilters =
    searchTerm || typeFilter || productFilter

  // Presenta las fechas del historial con formato local de Colombia.
  const formatMovementDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  return (
    <>
      <div className="movements-heading">
        <div className="movements-title-row">
          <div className="movements-title-icon">
            <Warehouse size={23} />
          </div>

          <div>
            <h2 className="page-title">Movimientos</h2>
            <p className="page-subtitle">
              Registra entradas y salidas y consulta el historial del inventario.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="movements-new-button"
          onClick={handleNewMovement}
        >
          <RefreshCw size={17} />
          Nuevo movimiento
        </button>
      </div>

      <section className="movements-metrics">
        <article className="movements-metric-card movements-metric-total">
          <div className="movements-metric-icon">
            <History size={21} />
          </div>

          <div>
            <span>Movimientos</span>
            <strong>{movementSummary.totalMovements}</strong>
            <small>Registrados</small>
          </div>
        </article>

        <article className="movements-metric-card movements-metric-entry">
          <div className="movements-metric-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Entradas</span>
            <strong>{movementSummary.entries}</strong>
            <small>{movementSummary.entryUnits} unidades</small>
          </div>
        </article>

        <article className="movements-metric-card movements-metric-exit">
          <div className="movements-metric-icon">
            <TrendingDown size={21} />
          </div>

          <div>
            <span>Salidas</span>
            <strong>{movementSummary.exits}</strong>
            <small>{movementSummary.exitUnits} unidades</small>
          </div>
        </article>

        <article className="movements-metric-card movements-metric-products">
          <div className="movements-metric-icon">
            <Boxes size={21} />
          </div>

          <div>
            <span>Productos</span>
            <strong>{products.length}</strong>
            <small>Disponibles</small>
          </div>
        </article>
      </section>

      {(error || message) && (
        <div
          className={
            error
              ? 'movements-feedback movements-feedback-error'
              : 'movements-feedback movements-feedback-success'
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

      <section className="movements-form-panel">
        <div className="movements-panel-heading">
          <div
            className={
              type === 'SALIDA'
                ? 'movements-panel-icon movements-panel-icon-exit'
                : type === 'ENTRADA'
                  ? 'movements-panel-icon movements-panel-icon-entry'
                  : 'movements-panel-icon'
            }
          >
            {type === 'SALIDA' ? (
              <ArrowUpFromLine size={19} />
            ) : (
              <ArrowDownToLine size={19} />
            )}
          </div>

          <div>
            <h3>Registrar movimiento</h3>
            <p>
              Selecciona el producto y registra una entrada o salida de inventario.
            </p>
          </div>

          {type && (
            <span
              className={
                type === 'ENTRADA'
                  ? 'movements-type-indicator movements-type-entry'
                  : 'movements-type-indicator movements-type-exit'
              }
            >
              {type === 'ENTRADA' ? (
                <ArrowDownToLine size={14} />
              ) : (
                <ArrowUpFromLine size={14} />
              )}

              {type === 'ENTRADA' ? 'Entrada' : 'Salida'}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="movement-form-grid">
            <div className="form-group">
              <label htmlFor="product" className="form-label">
                Producto
              </label>

              <AppSelect
                ref={productSelectRef}
                id="product"
                className="form-input movements-form-input"
                value={productId}
                onChange={(event) =>
                  dispatchForm({ type: 'SET_FIELD', field: 'productId', value: event.target.value })
                }
                required
              >
                <option value="">Selecciona un producto</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.code} - {product.name}
                  </option>
                ))}
              </AppSelect>
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Tipo de movimiento
              </label>

              <AppSelect
                id="type"
                className="form-input movements-form-input"
                value={type}
                onChange={(event) =>
                  dispatchForm({ type: 'SET_FIELD', field: 'type', value: event.target.value })
                }
                required
              >
                <option value="">Selecciona un tipo</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </AppSelect>
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Cantidad
              </label>

              <input
                id="quantity"
                className="form-input movements-form-input"
                type="number"
                min="1"
                value={quantity}
                placeholder="Ej. 10"
                onChange={(event) =>
                  dispatchForm({ type: 'SET_FIELD', field: 'quantity', value: event.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="observation" className="form-label">
                Observación
              </label>

              <input
                id="observation"
                className="form-input movements-form-input"
                type="text"
                value={observation}
                onChange={(event) =>
                  dispatchForm({ type: 'SET_FIELD', field: 'observation', value: event.target.value })
                }
                placeholder="Ej. Compra a proveedor"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="movement-stock-preview">
              <div className="movement-stock-product">
                <div className="movement-stock-icon">
                  <Package size={18} />
                </div>

                <div>
                  <strong>{selectedProduct.name}</strong>
                  <span>{selectedProduct.code}</span>
                </div>
              </div>

              <div className="movement-stock-values">
                <div>
                  <span>Stock actual</span>
                  <strong>{selectedProduct.currentStock}</strong>
                </div>

                <div className="movement-stock-arrow">
                  {type === 'SALIDA' ? (
                    <ArrowUpFromLine size={18} />
                  ) : (
                    <ArrowDownToLine size={18} />
                  )}
                </div>

                <div>
                  <span>Stock resultante</span>
                  <strong
                    className={
                      exceedsAvailableStock
                        ? 'movement-result-danger'
                        : ''
                    }
                  >
                    {resultingStockPreview}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {exceedsAvailableStock && (
            <div className="movement-stock-warning">
              <CircleAlert size={16} />
              La cantidad solicitada supera el stock disponible.
            </div>
          )}

          <div className="movements-form-actions">
            <button
              type="submit"
              className={
                type === 'SALIDA'
                  ? 'movements-submit-button movements-submit-exit'
                  : 'movements-submit-button'
              }
              disabled={saving || exceedsAvailableStock}
            >
              {type === 'SALIDA' ? (
                <ArrowUpFromLine size={17} />
              ) : (
                <ArrowDownToLine size={17} />
              )}

              {saving ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      </section>

      <section className="movements-history-panel">
        <div className="movements-history-header">
          <div>
            <h3>Historial de movimientos</h3>
            <p>
              Consulta las entradas y salidas registradas en el inventario.
            </p>
          </div>

          <span className="movements-count">
            {movements.length}{' '}
            {movements.length === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>

        <div className="movements-toolbar">
          <div className="movements-search">
            <Search size={17} />

            <input
              type="search"
              value={searchTerm}
              placeholder="Buscar producto u observación..."
              aria-label="Buscar movimientos"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'searchTerm', value: event.target.value })
              }
            />
          </div>

          <div className="movements-filter">
            <Filter size={16} />

            <AppSelect
              value={typeFilter}
              aria-label="Filtrar por tipo"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'typeFilter', value: event.target.value })
              }
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
            </AppSelect>
          </div>

          <div className="movements-filter">
            <Package size={16} />

            <AppSelect
              value={productFilter}
              aria-label="Filtrar por producto"
              onChange={(event) =>
                dispatchFilters({ type: 'SET_FILTER', field: 'productFilter', value: event.target.value })
              }
            >
              <option value="">Todos los productos</option>

              {historyProducts.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.code} - {product.name}
                  {product.active === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </AppSelect>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="movements-clear-filters"
              onClick={clearFilters}
            >
              <X size={15} />
              Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="movements-filter-summary">
            Mostrando {filteredMovements.length} de {movements.length}{' '}
            movimientos.
          </div>
        )}

        <div className="movements-table-container">
          {loading ? (
            <div className="movements-state">
              <div className="movements-spinner" />
              <p>Cargando movimientos...</p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="movements-state movements-empty">
              <div className="movements-empty-icon">
                <History size={25} />
              </div>

              <h4>
                {hasActiveFilters
                  ? 'No encontramos movimientos'
                  : 'No hay movimientos registrados'}
              </h4>

              <p>
                {hasActiveFilters
                  ? 'Prueba cambiando los filtros o el término de búsqueda.'
                  : 'Registra la primera entrada o salida para comenzar el historial.'}
              </p>
            </div>
          ) : (
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock resultante</th>
                  <th>Observación</th>
                </tr>
              </thead>

              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <div className="movement-date-cell">
                        <CalendarDays size={15} />
                        <span>{formatMovementDate(movement.date)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="movement-product-cell">
                        <div className="movement-product-icon">
                          <Package size={16} />
                        </div>

                        <strong>{movement.productName}</strong>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          movement.type === 'ENTRADA'
                            ? 'movement-badge movement-entry'
                            : 'movement-badge movement-exit'
                        }
                      >
                        {movement.type === 'ENTRADA' ? (
                          <ArrowDownToLine size={13} />
                        ) : (
                          <ArrowUpFromLine size={13} />
                        )}

                        {movement.type === 'ENTRADA'
                          ? 'Entrada'
                          : 'Salida'}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          movement.type === 'ENTRADA'
                            ? 'movement-quantity movement-quantity-entry'
                            : 'movement-quantity movement-quantity-exit'
                        }
                      >
                        {movement.type === 'ENTRADA' ? '+' : '-'}
                        {movement.quantity}
                      </strong>
                    </td>

                    <td>
                      <span className="movement-resulting-stock">
                        {movement.resultingStock}
                      </span>
                    </td>

                    <td>
                      <span className="movement-observation">
                        {movement.observation || 'Sin observación'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}

export default MovementsPage
