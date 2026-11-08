import { getErrorMessage } from '../utils/getErrorMessage'
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
import MovementForm from '../components/MovementForm'
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

  // Detecta salidas superiores al stock disponible.
  const requestedQuantity = Number(quantity || 0)

  const exceedsAvailableStock =
    type === 'SALIDA' &&
    selectedProduct &&
    requestedQuantity > selectedProduct.currentStock

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

  const handleFieldChange = (field, value) => {
    dispatchForm({ type: 'SET_FIELD', field, value })
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
        getErrorMessage(error, 'No fue posible registrar el movimiento'),
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

      <MovementForm
        form={form}
        products={products}
        selectedProduct={selectedProduct}
        exceedsAvailableStock={exceedsAvailableStock}
        saving={saving}
        productSelectRef={productSelectRef}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />

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
