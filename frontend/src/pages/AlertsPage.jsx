import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CircleAlert,
  PackageSearch,
  PackageX,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { getLowStockAlerts } from '../services/alertService'
import '../styles/pages/alerts.css'

function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('critical')

  const fetchAlerts = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const data = await getLowStockAlerts()
      setAlerts(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible cargar las alertas',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadAlerts = async () => {
      try {
        const data = await getLowStockAlerts()

        if (!cancelled) {
          setAlerts(data)
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              'No fue posible cargar las alertas',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAlerts()

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    return alerts.reduce(
      (result, alert) => {
        if (alert.currentStock === 0) {
          result.outOfStock += 1
        } else {
          result.lowStock += 1
        }

        return result
      },
      {
        lowStock: 0,
        outOfStock: 0,
      },
    )
  }, [alerts])

  const filteredAlerts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const result = alerts.filter((alert) => {
      const isOutOfStock = alert.currentStock === 0

      const matchesSearch =
        !query ||
        alert.name.toLowerCase().includes(query) ||
        alert.code.toLowerCase().includes(query)

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'OUT_OF_STOCK' && isOutOfStock) ||
        (statusFilter === 'LOW_STOCK' && !isOutOfStock)

      return matchesSearch && matchesStatus
    })

    return [...result].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name, 'es')
      }

      if (sortOrder === 'stock') {
        return a.currentStock - b.currentStock
      }

      const aOut = a.currentStock === 0
      const bOut = b.currentStock === 0

      if (aOut !== bOut) {
        return aOut ? -1 : 1
      }

      const aDeficit = a.minimumStock - a.currentStock
      const bDeficit = b.minimumStock - b.currentStock

      return bDeficit - aDeficit
    })
  }, [alerts, searchTerm, statusFilter, sortOrder])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setSortOrder('critical')
  }

  const hasActiveFilters =
    searchTerm || statusFilter || sortOrder !== 'critical'

  return (
    <>
      <div className="alerts-heading">
        <div className="alerts-title-row">
          <div className="alerts-title-icon">
            <AlertTriangle size={23} />
          </div>

          <div>
            <h2 className="page-title">Alertas</h2>
            <p className="page-subtitle">
              Identifica productos con bajo stock o sin unidades disponibles.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="alerts-refresh-button"
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'alerts-refresh-spin' : ''}
          />
          {refreshing ? 'Actualizando...' : 'Actualizar alertas'}
        </button>
      </div>

      <section className="alerts-metrics">
        <article className="alerts-metric-card alerts-metric-total">
          <div className="alerts-metric-icon">
            <Boxes size={21} />
          </div>

          <div>
            <span>Alertas activas</span>
            <strong>{alerts.length}</strong>
            <small>Productos por revisar</small>
          </div>
        </article>

        <article className="alerts-metric-card alerts-metric-low">
          <div className="alerts-metric-icon">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Bajo stock</span>
            <strong>{summary.lowStock}</strong>
            <small>Requieren reposición</small>
          </div>
        </article>

        <article className="alerts-metric-card alerts-metric-out">
          <div className="alerts-metric-icon">
            <PackageX size={21} />
          </div>

          <div>
            <span>Sin stock</span>
            <strong>{summary.outOfStock}</strong>
            <small>Sin unidades</small>
          </div>
        </article>
      </section>

      {error && (
        <div className="alerts-feedback alerts-feedback-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="alerts-panel">
        <div className="alerts-panel-header">
          <div>
            <h3>Estado de alertas</h3>
            <p>
              Revisa primero los productos agotados y luego los que están por debajo del mínimo.
            </p>
          </div>

          <span className="alerts-count">
            {alerts.length}{' '}
            {alerts.length === 1 ? 'alerta' : 'alertas'}
          </span>
        </div>

        <div className="alerts-toolbar">
          <div className="alerts-search">
            <Search size={17} />

            <input
              type="search"
              value={searchTerm}
              placeholder="Buscar por código o producto..."
              aria-label="Buscar alertas"
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="alerts-filter">
            <SlidersHorizontal size={16} />

            <select
              value={statusFilter}
              aria-label="Filtrar por estado"
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">Todos los estados</option>
              <option value="LOW_STOCK">Bajo stock</option>
              <option value="OUT_OF_STOCK">Sin stock</option>
            </select>
          </div>

          <div className="alerts-filter">
            <PackageSearch size={16} />

            <select
              value={sortOrder}
              aria-label="Ordenar alertas"
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
            >
              <option value="critical">Más críticas primero</option>
              <option value="stock">Menor stock primero</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="alerts-clear-filters"
              onClick={clearFilters}
            >
              <X size={15} />
              Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="alerts-filter-summary">
            Mostrando {filteredAlerts.length} de {alerts.length}{' '}
            alertas.
          </div>
        )}

        {loading ? (
          <div className="alerts-state">
            <div className="alerts-spinner" />
            <p>Cargando alertas...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="alerts-state alerts-empty-success">
            <div className="alerts-empty-success-icon">
              <ShieldCheck size={28} />
            </div>

            <h3>Inventario sin alertas</h3>

            <p>
              Todos los productos se encuentran por encima de su stock mínimo.
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="alerts-state">
            <div className="alerts-empty-icon">
              <PackageSearch size={26} />
            </div>

            <h3>No encontramos alertas</h3>

            <p>
              Prueba con otro término de búsqueda o cambia los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="alerts-grid">
            {filteredAlerts.map((alert) => {
              const isOutOfStock = alert.currentStock === 0
              const deficit = Math.max(
                alert.minimumStock - alert.currentStock,
                0,
              )

              const progress =
                alert.minimumStock > 0
                  ? Math.min(
                      (alert.currentStock / alert.minimumStock) * 100,
                      100,
                    )
                  : 0

              return (
                <article
                  className={
                    isOutOfStock
                      ? 'alert-card alert-card-out'
                      : 'alert-card alert-card-low'
                  }
                  key={alert.productId}
                >
                  <div className="alert-card-accent" />

                  <div className="alert-card-header">
                    <div className="alert-product-heading">
                      <div
                        className={
                          isOutOfStock
                            ? 'alert-product-icon alert-product-icon-out'
                            : 'alert-product-icon alert-product-icon-low'
                        }
                      >
                        {isOutOfStock ? (
                          <PackageX size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </div>

                      <div>
                        <span className="alert-code">
                          {alert.code}
                        </span>

                        <h3>{alert.name}</h3>
                      </div>
                    </div>

                    <span
                      className={
                        isOutOfStock
                          ? 'alert-badge alert-badge-out'
                          : 'alert-badge alert-badge-low'
                      }
                    >
                      {isOutOfStock ? (
                        <PackageX size={13} />
                      ) : (
                        <AlertTriangle size={13} />
                      )}

                      {isOutOfStock ? 'Sin stock' : 'Bajo stock'}
                    </span>
                  </div>

                  <div className="alert-message">
                    {isOutOfStock ? (
                      <CircleAlert size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}

                    <p>
                      {isOutOfStock
                        ? 'El producto no tiene unidades disponibles y requiere reposición.'
                        : `Faltan ${deficit} ${
                            deficit === 1 ? 'unidad' : 'unidades'
                          } para alcanzar el stock mínimo.`}
                    </p>
                  </div>

                  <div className="alert-stock-info">
                    <div className="alert-stock-item">
                      <span>Stock actual</span>

                      <strong
                        className={
                          isOutOfStock
                            ? 'alert-stock-danger'
                            : 'alert-stock-warning'
                        }
                      >
                        {alert.currentStock}
                      </strong>
                    </div>

                    <div className="alert-stock-divider" />

                    <div className="alert-stock-item">
                      <span>Stock mínimo</span>
                      <strong>{alert.minimumStock}</strong>
                    </div>
                  </div>

                  <div className="alert-progress-section">
                    <div className="alert-progress-label">
                      <span>Nivel frente al mínimo</span>
                      <strong>
                        {alert.minimumStock > 0
                          ? `${Math.round(progress)}%`
                          : '0%'}
                      </strong>
                    </div>

                    <div className="alert-progress-track">
                      <div
                        className={
                          isOutOfStock
                            ? 'alert-progress-bar alert-progress-bar-out'
                            : 'alert-progress-bar alert-progress-bar-low'
                        }
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {!loading && alerts.length > 0 && (
        <section className="alerts-help-card">
          <div className="alerts-help-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <strong>Recomendación de inventario</strong>
            <p>
              Prioriza la reposición de productos sin stock y luego revisa los productos con mayor déficit frente a su mínimo.
            </p>
          </div>
        </section>
      )}
    </>
  )
}

export default AlertsPage
