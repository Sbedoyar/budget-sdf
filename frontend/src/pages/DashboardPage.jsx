import { useEffect, useState } from 'react'
import {
  getInventoryReport,
  getMovementReport,
} from '../services/reportService'

function DashboardPage() {
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('role')

  const [inventoryReport, setInventoryReport] = useState(null)
  const [movementReport, setMovementReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
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
            'No fue posible cargar el dashboard',
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return <p>Cargando dashboard...</p>
  }

  const recentMovements =
    movementReport?.movements?.slice(0, 5) || []

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>

        <p className="page-subtitle">
          Resumen general del inventario.
        </p>
      </div>

      <section className="card dashboard-welcome">
        <div>
          <h3>Bienvenido, {username}</h3>
          <p>Rol: {role}</p>
        </div>
      </section>

      {error && <p className="message-error">{error}</p>}

      {inventoryReport && (
        <>
          <h3 className="section-title dashboard-section">
            Inventario
          </h3>

          <div className="summary-grid">
            <article className="summary-card">
              <span>Total de productos</span>
              <strong>
                {inventoryReport.summary.totalProducts}
              </strong>
            </article>

            <article className="summary-card">
              <span>Unidades en stock</span>
              <strong>
                {inventoryReport.summary.totalUnitsInStock}
              </strong>
            </article>

            <article className="summary-card">
              <span>Stock bajo</span>
              <strong>
                {inventoryReport.summary.productsWithLowStock}
              </strong>
            </article>

            <article className="summary-card">
              <span>Sin stock</span>
              <strong>
                {inventoryReport.summary.productsOutOfStock}
              </strong>
            </article>
          </div>
        </>
      )}

      {movementReport && (
        <>
          <h3 className="section-title dashboard-section">
            Movimientos
          </h3>

          <div className="summary-grid">
            <article className="summary-card">
              <span>Total de movimientos</span>
              <strong>
                {movementReport.summary.totalMovements}
              </strong>
            </article>

            <article className="summary-card">
              <span>Entradas</span>
              <strong>
                {movementReport.summary.totalInbound}
              </strong>
            </article>

            <article className="summary-card">
              <span>Salidas</span>
              <strong>
                {movementReport.summary.totalOutbound}
              </strong>
            </article>

            <article className="summary-card">
              <span>Balance</span>
              <strong>
                {movementReport.summary.unitBalance}
              </strong>
            </article>
          </div>

          <h3 className="section-title dashboard-section">
            Movimientos recientes
          </h3>

          <div className="table-container">
            {recentMovements.length === 0 ? (
              <p>No hay movimientos registrados.</p>
            ) : (
              <table className="data-table">
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
                        ).toLocaleString()}
                      </td>

                      <td>{movement.productName}</td>

                      <td>
                        <span
                          className={
                            movement.type === 'ENTRADA'
                              ? 'movement-badge movement-entry'
                              : 'movement-badge movement-exit'
                          }
                        >
                          {movement.type}
                        </span>
                      </td>

                      <td>{movement.quantity}</td>
                      <td>{movement.resultingStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default DashboardPage