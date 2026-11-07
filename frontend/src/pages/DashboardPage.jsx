import { getErrorMessage } from '../utils/getErrorMessage'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Box,
  Boxes,
  PackageX,
  Warehouse,
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
import { getLowStockAlerts } from '../services/alertService'
import {
  getInventoryReport,
  getMovementReport,
} from '../services/reportService'
import '../styles/pages/dashboard.css'
import { useAuth } from '../hooks/useAuth'

// Resume inventario, actividad reciente y alertas mediante datos combinados de varios endpoints.
function DashboardPage() {
  const { username: sessionUsername } = useAuth()
  const username = sessionUsername || 'propietario'

  const [inventoryReport, setInventoryReport] = useState(null)
  const [movementReport, setMovementReport] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Carga en paralelo los reportes y las alertas que alimentan los indicadores del dashboard.
  useEffect(() => {
    let cancelled = false

    const fetchDashboard = async () => {
      try {
        const [inventoryData, movementData, alertsData] =
          await Promise.all([
            getInventoryReport(),
            getMovementReport(),
            getLowStockAlerts(),
          ])

        if (!cancelled) {
          setInventoryReport(inventoryData)
          setMovementReport(movementData)
          setAlerts(alertsData)
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            getErrorMessage(error, 'No fue posible cargar el dashboard'),
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  // Agrupa cantidades de entrada y salida por día para los últimos siete días.
  const movementChartData = useMemo(() => {
    const movements = movementReport?.movements || []
    const days = []

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date()

      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - index)

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')

      days.push({
        dateKey,
        label: date.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
        }),
        entries: 0,
        exits: 0,
      })
    }

    movements.forEach((movement) => {
      const movementDate = new Date(movement.date)

      const movementKey = [
        movementDate.getFullYear(),
        String(movementDate.getMonth() + 1).padStart(2, '0'),
        String(movementDate.getDate()).padStart(2, '0'),
      ].join('-')

      const day = days.find(
        (item) => item.dateKey === movementKey,
      )

      if (!day) {
        return
      }

      if (movement.type === 'ENTRADA') {
        day.entries += movement.quantity
      }

      if (movement.type === 'SALIDA') {
        day.exits += movement.quantity
      }
    })

    return days
  }, [movementReport])

  // Prepara los conteos de stock para el gráfico y su leyenda.
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  const recentMovements =
    movementReport?.movements?.slice(0, 5) || []

  const criticalAlerts = alerts.slice(0, 4)

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Bienvenido de nuevo, {username}. Aquí tienes el
            resumen de tu inventario.
          </p>
        </div>

        <div className="dashboard-date">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {error && <p className="message-error">{error}</p>}

      {inventoryReport && movementReport && (
        <>
          <section className="dashboard-metrics">
            <article className="metric-card">
              <div className="metric-icon metric-icon-green">
                <Boxes size={24} />
              </div>

              <div className="metric-content">
                <span>Productos registrados</span>
                <strong>
                  {inventoryReport.summary.totalProducts}
                </strong>
                <small>Total de productos</small>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon metric-icon-emerald">
                <Warehouse size={24} />
              </div>

              <div className="metric-content">
                <span>Unidades en stock</span>
                <strong>
                  {inventoryReport.summary.totalUnitsInStock}
                </strong>
                <small>Inventario disponible</small>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon metric-icon-warning">
                <AlertTriangle size={24} />
              </div>

              <div className="metric-content">
                <span>Productos con stock bajo</span>
                <strong>
                  {inventoryReport.summary.productsWithLowStock}
                </strong>
                <small>Requieren atención</small>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon metric-icon-danger">
                <PackageX size={24} />
              </div>

              <div className="metric-content">
                <span>Productos sin stock</span>
                <strong>
                  {inventoryReport.summary.productsOutOfStock}
                </strong>
                <small>Sin unidades disponibles</small>
              </div>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Entradas y salidas</h3>
                  <p>
                    Movimiento de unidades durante los últimos
                    7 días
                  </p>
                </div>

                <div className="chart-legend">
                  <span>
                    <i className="legend-dot legend-entry" />
                    Entradas
                  </span>

                  <span>
                    <i className="legend-dot legend-exit" />
                    Salidas
                  </span>
                </div>
              </div>

              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748b',
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: 'rgba(16, 185, 129, 0.05)',
                      }}
                    />

                    <Bar
                      dataKey="entries"
                      name="Entradas"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="exits"
                      name="Salidas"
                      fill="#065f46"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Estado del inventario</h3>
                  <p>Distribución actual de productos</p>
                </div>
              </div>

              <div className="inventory-status-layout">
                <div className="inventory-pie">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
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

                  <div className="inventory-pie-center">
                    <strong>
                      {inventoryReport.summary.totalProducts}
                    </strong>
                    <span>productos</span>
                  </div>
                </div>

                <div className="inventory-status-list">
                  {inventoryStatusData.map((item) => (
                    <div
                      className="inventory-status-row"
                      key={item.name}
                    >
                      <div>
                        <span
                          className="inventory-status-dot"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />
                        <span>{item.name}</span>
                      </div>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Movimientos recientes</h3>
                  <p>
                    Últimos movimientos registrados en el sistema
                  </p>
                </div>

                <a
                  href="/movements"
                  className="dashboard-link"
                >
                  Ver todos
                  <ArrowRight size={16} />
                </a>
              </div>

              {recentMovements.length === 0 ? (
                <div className="dashboard-empty">
                  No hay movimientos registrados.
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Stock resultante</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            {new Date(
                              movement.date,
                            ).toLocaleString('es-CO')}
                          </td>

                          <td>
                            <div className="dashboard-product">
                              <div className="product-mini-icon">
                                <Box size={15} />
                              </div>

                              <span>{movement.productName}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                movement.type === 'ENTRADA'
                                  ? 'dashboard-movement-badge dashboard-entry'
                                  : 'dashboard-movement-badge dashboard-exit'
                              }
                            >
                              {movement.type === 'ENTRADA' ? (
                                <ArrowUpRight size={13} />
                              ) : (
                                <ArrowDownRight size={13} />
                              )}

                              {movement.type}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {movement.type === 'ENTRADA'
                                ? '+'
                                : '-'}
                              {movement.quantity}
                            </strong>
                          </td>

                          <td>{movement.resultingStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="dashboard-panel dashboard-alert-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Alertas de inventario</h3>
                  <p>Productos que requieren atención</p>
                </div>

                <a href="/alerts" className="dashboard-link">
                  Ver todas
                  <ArrowRight size={16} />
                </a>
              </div>

              {criticalAlerts.length === 0 ? (
                <div className="dashboard-alert-success">
                  <div>
                    <Box size={22} />
                  </div>

                  <div>
                    <strong>Inventario en buen estado</strong>
                    <span>
                      No hay productos con alertas actualmente.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="dashboard-alert-list">
                  {criticalAlerts.map((alert) => {
                    const isOutOfStock =
                      alert.currentStock === 0

                    return (
                      <div
                        className="dashboard-alert-item"
                        key={alert.productId}
                      >
                        <div
                          className={
                            isOutOfStock
                              ? 'dashboard-alert-icon alert-icon-danger'
                              : 'dashboard-alert-icon alert-icon-warning'
                          }
                        >
                          {isOutOfStock ? (
                            <PackageX size={19} />
                          ) : (
                            <AlertTriangle size={19} />
                          )}
                        </div>

                        <div className="dashboard-alert-info">
                          <strong>{alert.name}</strong>
                          <span>{alert.code}</span>
                        </div>

                        <div className="dashboard-alert-stock">
                          <span
                            className={
                              isOutOfStock
                                ? 'alert-state alert-state-danger'
                                : 'alert-state alert-state-warning'
                            }
                          >
                            {isOutOfStock
                              ? 'Sin stock'
                              : 'Bajo stock'}
                          </span>

                          <strong>{alert.currentStock}</strong>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </>
  )
}

export default DashboardPage
