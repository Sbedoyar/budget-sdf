import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Filter,
  History,
  Layers3,
  Package,
  PackageCheck,
  PackageX,
  RefreshCw,
  Scale,
  Search,
  Warehouse,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getInventoryReport,
  getMovementReport,
} from '../services/reportService'
import '../styles/pages/reports.css'

// Presenta reportes de inventario y movimientos con filtros y agregados calculados localmente.
function ReportsPage() {
  const [inventoryReport, setInventoryReport] = useState(null)
  const [movementReport, setMovementReport] = useState(null)

  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('')

  const [productMovementSearch, setProductMovementSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyTypeFilter, setHistoryTypeFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Solicita en paralelo los reportes de inventario y movimientos al cargar la página.
  useEffect(() => {
    let cancelled = false

    const fetchReports = async () => {
      try {
        const [inventoryData, movementData] = await Promise.all([
          getInventoryReport(),
          getMovementReport(),
        ])

        if (!cancelled) {
          setInventoryReport(inventoryData)
          setMovementReport(movementData)
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              'No fue posible cargar los reportes',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchReports()

    return () => {
      cancelled = true
    }
  }, [])

  // Vuelve a consultar ambos reportes y conserva el mensaje de error si falla la actualización.
  const refreshReports = async () => {
    try {
      setRefreshing(true)
      setError('')

      const [inventoryData, movementData] = await Promise.all([
        getInventoryReport(),
        getMovementReport(),
      ])

      setInventoryReport(inventoryData)
      setMovementReport(movementData)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible actualizar los reportes',
      )
    } finally {
      setRefreshing(false)
    }
  }

  // Traduce los estados de stock del backend a etiquetas visibles en español.
  const getStockStatusLabel = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'Sin stock'
      case 'LOW_STOCK':
        return 'Bajo stock'
      case 'NORMAL':
        return 'Normal'
      default:
        return status
    }
  }

  // Asocia cada estado recibido con la clase visual usada en sus indicadores.
  const getStockStatusClass = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'report-status-badge report-status-out'
      case 'LOW_STOCK':
        return 'report-status-badge report-status-low'
      case 'NORMAL':
        return 'report-status-badge report-status-normal'
      default:
        return 'report-status-badge'
    }
  }

  // Prepara los totales por estado para el gráfico circular de inventario.
  const inventoryStatusData = useMemo(() => {
    if (!inventoryReport) {
      return []
    }

    return [
      {
        name: 'Normal',
        value: inventoryReport.summary.productsWithNormalStock,
        color: '#10b981',
      },
      {
        name: 'Bajo stock',
        value: inventoryReport.summary.productsWithLowStock,
        color: '#f59e0b',
      },
      {
        name: 'Sin stock',
        value: inventoryReport.summary.productsOutOfStock,
        color: '#ef4444',
      },
    ]
  }, [inventoryReport])

  // Busca productos por código, nombre o categoría y aplica el filtro de estado.
  const filteredInventoryProducts = useMemo(() => {
    if (!inventoryReport) {
      return []
    }

    const query = inventorySearch.trim().toLowerCase()

    return inventoryReport.products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.code).toLowerCase().includes(query) ||
        String(product.name).toLowerCase().includes(query) ||
        String(product.category).toLowerCase().includes(query)

      const matchesStatus =
        !inventoryStatusFilter ||
        product.stockStatus === inventoryStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [inventoryReport, inventorySearch, inventoryStatusFilter])

  // Selecciona los productos con mayor actividad para comparar entradas y salidas.
  const movementChartData = useMemo(() => {
    if (!movementReport) {
      return []
    }

    return [...movementReport.byProduct]
      .sort(
        (a, b) =>
          b.inboundUnits +
          b.outboundUnits -
          (a.inboundUnits + a.outboundUnits),
      )
      .slice(0, 8)
      .map((product) => ({
        name: product.name,
        entradas: product.inboundUnits,
        salidas: product.outboundUnits,
      }))
  }, [movementReport])

  // Busca por código o nombre dentro del resumen de movimientos por producto.
  const filteredMovementProducts = useMemo(() => {
    if (!movementReport) {
      return []
    }

    const query = productMovementSearch.trim().toLowerCase()

    return movementReport.byProduct.filter((product) => {
      return (
        !query ||
        String(product.code).toLowerCase().includes(query) ||
        String(product.name).toLowerCase().includes(query)
      )
    })
  }, [movementReport, productMovementSearch])

  // Filtra el historial del reporte por datos del producto, observación y tipo de movimiento.
  const filteredMovementHistory = useMemo(() => {
    if (!movementReport) {
      return []
    }

    const query = historySearch.trim().toLowerCase()

    return movementReport.movements.filter((movement) => {
      const observation = movement.observation || ''

      const matchesSearch =
        !query ||
        String(movement.productCode).toLowerCase().includes(query) ||
        String(movement.productName).toLowerCase().includes(query) ||
        observation.toLowerCase().includes(query)

      const matchesType =
        !historyTypeFilter || movement.type === historyTypeFilter

      return matchesSearch && matchesType
    })
  }, [movementReport, historySearch, historyTypeFilter])

  // Formatea las fechas del reporte según la configuración regional de Colombia.
  const formatMovementDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  const hasInventoryFilters =
    inventorySearch || inventoryStatusFilter

  const hasHistoryFilters =
    historySearch || historyTypeFilter

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="reports-loading-spinner" />
        <p>Cargando reportes...</p>
      </div>
    )
  }

  return (
    <>
      <div className="reports-heading">
        <div className="reports-title-row">
          <div className="reports-title-icon">
            <BarChart3 size={23} />
          </div>

          <div>
            <h2 className="page-title">Reportes</h2>
            <p className="page-subtitle">
              Analiza el estado del inventario y el comportamiento de sus movimientos.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="reports-refresh-button"
          onClick={refreshReports}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'reports-refresh-spin' : ''}
          />
          {refreshing ? 'Actualizando...' : 'Actualizar reportes'}
        </button>
      </div>

      {error && (
        <div className="reports-feedback-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {inventoryReport && (
        <section className="report-section">
          <div className="report-section-heading">
            <div className="report-section-title">
              <div className="report-section-icon">
                <Warehouse size={20} />
              </div>

              <div>
                <h3>Reporte de inventario</h3>
                <p>
                  Resumen actual del stock y estado de todos los productos.
                </p>
              </div>
            </div>

            <span className="report-section-chip">
              <Activity size={14} />
              Estado actual
            </span>
          </div>

          <div className="report-summary-grid report-inventory-summary">
            <article className="report-summary-card report-summary-products">
              <div className="report-summary-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Total productos</span>
                <strong>{inventoryReport.summary.totalProducts}</strong>
                <small>Registrados</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-units">
              <div className="report-summary-icon">
                <Boxes size={20} />
              </div>

              <div>
                <span>Unidades en stock</span>
                <strong>
                  {inventoryReport.summary.totalUnitsInStock}
                </strong>
                <small>Disponibles</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-low">
              <div className="report-summary-icon">
                <AlertTriangle size={20} />
              </div>

              <div>
                <span>Stock bajo</span>
                <strong>
                  {inventoryReport.summary.productsWithLowStock}
                </strong>
                <small>Requieren atención</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-out">
              <div className="report-summary-icon">
                <PackageX size={20} />
              </div>

              <div>
                <span>Sin stock</span>
                <strong>
                  {inventoryReport.summary.productsOutOfStock}
                </strong>
                <small>Sin unidades</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-normal">
              <div className="report-summary-icon">
                <PackageCheck size={20} />
              </div>

              <div>
                <span>Stock normal</span>
                <strong>
                  {inventoryReport.summary.productsWithNormalStock}
                </strong>
                <small>Sin alertas</small>
              </div>
            </article>
          </div>

          <div className="report-visual-grid">
            <article className="report-chart-card">
              <div className="report-card-heading">
                <div>
                  <h4>Distribución del inventario</h4>
                  <p>Productos agrupados por estado de stock.</p>
                </div>

                <Layers3 size={19} />
              </div>

              <div className="report-donut-layout">
                <div className="report-donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryStatusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={86}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {inventoryStatusData.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="report-donut-center">
                    <strong>
                      {inventoryReport.summary.totalProducts}
                    </strong>
                    <span>productos</span>
                  </div>
                </div>

                <div className="report-donut-legend">
                  {inventoryStatusData.map((item) => (
                    <div
                      className="report-donut-row"
                      key={item.name}
                    >
                      <div>
                        <span
                          className="report-legend-dot"
                          style={{ background: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="report-health-card">
              <div className="report-card-heading">
                <div>
                  <h4>Lectura rápida</h4>
                  <p>Indicadores clave para revisar el inventario.</p>
                </div>

                <CheckCircle2 size={19} />
              </div>

              <div className="report-health-list">
                <div className="report-health-row">
                  <div className="report-health-icon report-health-normal">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <span>Productos en estado normal</span>
                    <strong>
                      {inventoryReport.summary.productsWithNormalStock}
                    </strong>
                  </div>
                </div>

                <div className="report-health-row">
                  <div className="report-health-icon report-health-low">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <span>Productos por reponer pronto</span>
                    <strong>
                      {inventoryReport.summary.productsWithLowStock}
                    </strong>
                  </div>
                </div>

                <div className="report-health-row">
                  <div className="report-health-icon report-health-out">
                    <PackageX size={17} />
                  </div>

                  <div>
                    <span>Productos agotados</span>
                    <strong>
                      {inventoryReport.summary.productsOutOfStock}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="report-table-panel">
            <div className="report-table-heading">
              <div>
                <h4>Detalle del inventario</h4>
                <p>
                  Consulta el stock actual, mínimo y estado de cada producto.
                </p>
              </div>

              <span>
                {inventoryReport.products.length}{' '}
                {inventoryReport.products.length === 1
                  ? 'producto'
                  : 'productos'}
              </span>
            </div>

            <div className="report-toolbar">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={inventorySearch}
                  placeholder="Buscar código, producto o categoría..."
                  aria-label="Buscar en reporte de inventario"
                  onChange={(event) =>
                    setInventorySearch(event.target.value)
                  }
                />
              </div>

              <div className="report-filter">
                <Filter size={15} />

                <select
                  value={inventoryStatusFilter}
                  aria-label="Filtrar inventario por estado"
                  onChange={(event) =>
                    setInventoryStatusFilter(event.target.value)
                  }
                >
                  <option value="">Todos los estados</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW_STOCK">Bajo stock</option>
                  <option value="OUT_OF_STOCK">Sin stock</option>
                </select>
              </div>

              {hasInventoryFilters && (
                <button
                  type="button"
                  className="report-clear-button"
                  onClick={() => {
                    setInventorySearch('')
                    setInventoryStatusFilter('')
                  }}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {hasInventoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredInventoryProducts.length} de{' '}
                {inventoryReport.products.length} productos.
              </div>
            )}

            <div className="report-table-container">
              {filteredInventoryProducts.length === 0 ? (
                <div className="report-empty-state">
                  <Package size={25} />
                  <h4>No encontramos productos</h4>
                  <p>
                    Prueba cambiando el término de búsqueda o el filtro seleccionado.
                  </p>
                </div>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Unidad</th>
                      <th>Stock actual</th>
                      <th>Stock mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInventoryProducts.map((product) => (
                      <tr key={product.productId}>
                        <td>
                          <div className="report-product-cell">
                            <div className="report-product-icon">
                              <Package size={15} />
                            </div>

                            <div>
                              <strong>{product.name}</strong>
                              <span>{product.code}</span>
                            </div>
                          </div>
                        </td>

                        <td>{product.category}</td>
                        <td>{product.unitOfMeasure}</td>

                        <td>
                          <strong
                            className={
                              product.stockStatus === 'OUT_OF_STOCK'
                                ? 'report-stock-value report-stock-out'
                                : product.stockStatus === 'LOW_STOCK'
                                  ? 'report-stock-value report-stock-low'
                                  : 'report-stock-value report-stock-normal'
                            }
                          >
                            {product.currentStock}
                          </strong>
                        </td>

                        <td>{product.minimumStock}</td>

                        <td>
                          <span
                            className={getStockStatusClass(
                              product.stockStatus,
                            )}
                          >
                            {product.stockStatus === 'NORMAL' && (
                              <CheckCircle2 size={12} />
                            )}

                            {product.stockStatus === 'LOW_STOCK' && (
                              <AlertTriangle size={12} />
                            )}

                            {product.stockStatus === 'OUT_OF_STOCK' && (
                              <PackageX size={12} />
                            )}

                            {getStockStatusLabel(product.stockStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}

      {movementReport && (
        <section className="report-section report-movement-section">
          <div className="report-section-heading">
            <div className="report-section-title">
              <div className="report-section-icon">
                <History size={20} />
              </div>

              <div>
                <h3>Reporte de movimientos</h3>
                <p>
                  Analiza las entradas, salidas y balances del inventario.
                </p>
              </div>
            </div>

            <span className="report-section-chip">
              <Scale size={14} />
              Balance de unidades
            </span>
          </div>

          <div className="report-summary-grid report-movement-summary">
            <article className="report-summary-card report-summary-movements">
              <div className="report-summary-icon">
                <History size={20} />
              </div>

              <div>
                <span>Movimientos</span>
                <strong>
                  {movementReport.summary.totalMovements}
                </strong>
                <small>Registrados</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-inbound">
              <div className="report-summary-icon">
                <ArrowDownToLine size={20} />
              </div>

              <div>
                <span>Total entradas</span>
                <strong>{movementReport.summary.totalInbound}</strong>
                <small>
                  {movementReport.summary.inboundUnits} unidades
                </small>
              </div>
            </article>

            <article className="report-summary-card report-summary-outbound">
              <div className="report-summary-icon">
                <ArrowUpFromLine size={20} />
              </div>

              <div>
                <span>Total salidas</span>
                <strong>{movementReport.summary.totalOutbound}</strong>
                <small>
                  {movementReport.summary.outboundUnits} unidades
                </small>
              </div>
            </article>

            <article className="report-summary-card report-summary-balance">
              <div className="report-summary-icon">
                <Scale size={20} />
              </div>

              <div>
                <span>Balance</span>
                <strong>{movementReport.summary.unitBalance}</strong>
                <small>Unidades netas</small>
              </div>
            </article>
          </div>

          <article className="report-chart-card report-movement-chart-card">
            <div className="report-card-heading">
              <div>
                <h4>Unidades por producto</h4>
                <p>
                  Comparación de unidades ingresadas y retiradas en los productos con mayor actividad.
                </p>
              </div>

              <BarChart3 size={19} />
            </div>

            {movementChartData.length === 0 ? (
              <div className="report-empty-state report-chart-empty">
                <BarChart3 size={25} />
                <h4>Sin datos para graficar</h4>
                <p>No hay movimientos registrados por producto.</p>
              </div>
            ) : (
              <div className="report-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={movementChartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#dce8e2"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="entradas"
                      name="Entradas"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="salidas"
                      name="Salidas"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <div className="report-table-panel">
            <div className="report-table-heading">
              <div>
                <h4>Resumen por producto</h4>
                <p>
                  Consulta entradas, salidas y balance acumulado por producto.
                </p>
              </div>

              <span>
                {movementReport.byProduct.length}{' '}
                {movementReport.byProduct.length === 1
                  ? 'producto'
                  : 'productos'}
              </span>
            </div>

            <div className="report-toolbar report-toolbar-simple">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={productMovementSearch}
                  placeholder="Buscar producto o código..."
                  aria-label="Buscar resumen de movimientos por producto"
                  onChange={(event) =>
                    setProductMovementSearch(event.target.value)
                  }
                />
              </div>

              {productMovementSearch && (
                <button
                  type="button"
                  className="report-clear-button"
                  onClick={() => setProductMovementSearch('')}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            <div className="report-table-container">
              {filteredMovementProducts.length === 0 ? (
                <div className="report-empty-state">
                  <Package size={25} />
                  <h4>No encontramos productos</h4>
                  <p>
                    Prueba con otro código o nombre de producto.
                  </p>
                </div>
              ) : (
                <table className="report-table report-movement-product-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Movimientos</th>
                      <th>Entradas</th>
                      <th>Salidas</th>
                      <th>Unidades entrada</th>
                      <th>Unidades salida</th>
                      <th>Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMovementProducts.map((product) => (
                      <tr key={product.productId}>
                        <td>
                          <div className="report-product-cell">
                            <div className="report-product-icon">
                              <Package size={15} />
                            </div>

                            <div>
                              <strong>{product.name}</strong>
                              <span>{product.code}</span>
                            </div>
                          </div>
                        </td>

                        <td>{product.totalMovements}</td>

                        <td>
                          <span className="report-number-entry">
                            {product.totalInbound}
                          </span>
                        </td>

                        <td>
                          <span className="report-number-exit">
                            {product.totalOutbound}
                          </span>
                        </td>

                        <td>{product.inboundUnits}</td>
                        <td>{product.outboundUnits}</td>

                        <td>
                          <strong
                            className={
                              product.unitBalance < 0
                                ? 'report-balance report-balance-negative'
                                : 'report-balance report-balance-positive'
                            }
                          >
                            {product.unitBalance}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="report-table-panel report-history-panel">
            <div className="report-table-heading">
              <div>
                <h4>Historial de movimientos</h4>
                <p>
                  Detalle cronológico de entradas y salidas registradas.
                </p>
              </div>

              <span>
                {movementReport.movements.length}{' '}
                {movementReport.movements.length === 1
                  ? 'movimiento'
                  : 'movimientos'}
              </span>
            </div>

            <div className="report-toolbar">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={historySearch}
                  placeholder="Buscar producto, código u observación..."
                  aria-label="Buscar historial de movimientos"
                  onChange={(event) =>
                    setHistorySearch(event.target.value)
                  }
                />
              </div>

              <div className="report-filter">
                <Filter size={15} />

                <select
                  value={historyTypeFilter}
                  aria-label="Filtrar historial por tipo"
                  onChange={(event) =>
                    setHistoryTypeFilter(event.target.value)
                  }
                >
                  <option value="">Todos los tipos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                </select>
              </div>

              {hasHistoryFilters && (
                <button
                  type="button"
                  className="report-clear-button"
                  onClick={() => {
                    setHistorySearch('')
                    setHistoryTypeFilter('')
                  }}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {hasHistoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredMovementHistory.length} de{' '}
                {movementReport.movements.length} movimientos.
              </div>
            )}

            <div className="report-table-container">
              {filteredMovementHistory.length === 0 ? (
                <div className="report-empty-state">
                  <History size={25} />
                  <h4>No encontramos movimientos</h4>
                  <p>
                    Prueba cambiando el término de búsqueda o el tipo de movimiento.
                  </p>
                </div>
              ) : (
                <table className="report-table report-history-table">
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
                    {filteredMovementHistory.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          <div className="report-date-cell">
                            <CalendarDays size={14} />
                            <span>
                              {formatMovementDate(movement.date)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="report-product-cell">
                            <div className="report-product-icon">
                              <Package size={15} />
                            </div>

                            <div>
                              <strong>{movement.productName}</strong>
                              <span>{movement.productCode}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              movement.type === 'ENTRADA'
                                ? 'report-movement-badge report-movement-entry'
                                : 'report-movement-badge report-movement-exit'
                            }
                          >
                            {movement.type === 'ENTRADA' ? (
                              <ArrowDownToLine size={12} />
                            ) : (
                              <ArrowUpFromLine size={12} />
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
                                ? 'report-number-entry'
                                : 'report-number-exit'
                            }
                          >
                            {movement.type === 'ENTRADA' ? '+' : '-'}
                            {movement.quantity}
                          </strong>
                        </td>

                        <td>
                          <span className="report-stock-result">
                            {movement.resultingStock}
                          </span>
                        </td>

                        <td>
                          <span className="report-observation">
                            {movement.observation || 'Sin observación'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ReportsPage
