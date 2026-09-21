import { useEffect, useState } from 'react'
import { getLowStockAlerts } from '../services/alertService'

function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

    useEffect(() => {
    let cancelled = false

    const fetchAlerts = async () => {
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

    fetchAlerts()

    return () => {
        cancelled = true
    }
    }, [])

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Alertas</h2>

        <p className="page-subtitle">
          Productos que han alcanzado o están por debajo de su stock mínimo.
        </p>
      </div>

      {error && <p className="message-error">{error}</p>}

      {loading ? (
        <p>Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <section className="card empty-state">
          <h3>No hay alertas de stock</h3>
          <p>
            Todos los productos se encuentran por encima de su stock mínimo.
          </p>
        </section>
      ) : (
        <div className="alerts-grid">
          {alerts.map((alert) => (
            <article
              className="alert-card"
              key={alert.productId}
            >
              <div className="alert-card-header">
                <div>
                  <span className="alert-code">
                    {alert.code}
                  </span>

                  <h3>{alert.name}</h3>
                </div>

                <span className="alert-badge">
                  Bajo stock
                </span>
              </div>

              <p>
                El producto ha alcanzado o está por debajo de su stock mínimo.
              </p>

              <div className="alert-stock-info">
                <div>
                  <span>Stock actual</span>
                  <strong>{alert.currentStock}</strong>
                </div>

                <div>
                  <span>Stock mínimo</span>
                  <strong>{alert.minimumStock}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

export default AlertsPage