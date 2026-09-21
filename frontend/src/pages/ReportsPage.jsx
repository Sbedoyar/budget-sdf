import { useEffect, useState } from 'react'
import {
  getInventoryReport,
  getMovementReport,
} from '../services/reportService'

function ReportsPage() {
  const [inventoryReport, setInventoryReport] = useState(null)
  const [movementReport, setMovementReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const getStockStatusClass = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'status-badge status-out'
      case 'LOW_STOCK':
        return 'status-badge status-low'
      case 'NORMAL':
        return 'status-badge status-normal'
      default:
        return 'status-badge'
    }
  }

  if (loading) {
    return <p>Cargando reportes...</p>
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Reportes</h2>

        <p className="page-subtitle">
          Consulta el estado general del inventario y sus movimientos.
        </p>
      </div>

      {error && <p className="message-error">{error}</p>}

      {inventoryReport && (
        <>
          <h3 className="section-title">Reporte de inventario</h3>

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

            <article className="summary-card">
              <span>Stock normal</span>
              <strong>
                {inventoryReport.summary.productsWithNormalStock}
              </strong>
            </article>
          </div>

          <div className="table-container">
            {inventoryReport.products.length === 0 ? (
              <p>No hay productos para mostrar.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidad</th>
                    <th>Stock actual</th>
                    <th>Stock mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {inventoryReport.products.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.unitOfMeasure}</td>
                      <td>{product.currentStock}</td>
                      <td>{product.minimumStock}</td>

                      <td>
                        <span
                          className={getStockStatusClass(
                            product.stockStatus,
                          )}
                        >
                          {getStockStatusLabel(
                            product.stockStatus,
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {movementReport && (
        <>
          <h3 className="section-title report-spacing">
            Reporte de movimientos
          </h3>

          <div className="summary-grid">
            <article className="summary-card">
              <span>Total de movimientos</span>
              <strong>
                {movementReport.summary.totalMovements}
              </strong>
            </article>

            <article className="summary-card">
              <span>Total entradas</span>
              <strong>
                {movementReport.summary.totalInbound}
              </strong>
            </article>

            <article className="summary-card">
              <span>Total salidas</span>
              <strong>
                {movementReport.summary.totalOutbound}
              </strong>
            </article>

            <article className="summary-card">
              <span>Unidades ingresadas</span>
              <strong>
                {movementReport.summary.inboundUnits}
              </strong>
            </article>

            <article className="summary-card">
              <span>Unidades retiradas</span>
              <strong>
                {movementReport.summary.outboundUnits}
              </strong>
            </article>

            <article className="summary-card">
              <span>Balance de unidades</span>
              <strong>
                {movementReport.summary.unitBalance}
              </strong>
            </article>
          </div>

          <h4 className="subsection-title">
            Resumen por producto
          </h4>

          <div className="table-container">
            {movementReport.byProduct.length === 0 ? (
              <p>No hay movimientos por producto.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
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
                  {movementReport.byProduct.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td>{product.totalMovements}</td>
                      <td>{product.totalInbound}</td>
                      <td>{product.totalOutbound}</td>
                      <td>{product.inboundUnits}</td>
                      <td>{product.outboundUnits}</td>
                      <td>{product.unitBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <h4 className="subsection-title">
            Historial de movimientos
          </h4>

          <div className="table-container">
            {movementReport.movements.length === 0 ? (
              <p>No hay movimientos registrados.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock resultante</th>
                    <th>Observación</th>
                  </tr>
                </thead>

                <tbody>
                  {movementReport.movements.map((movement) => (
                    <tr key={movement.id}>
                      <td>
                        {new Date(
                          movement.date,
                        ).toLocaleString()}
                      </td>

                      <td>{movement.productCode}</td>
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
                      <td>{movement.observation || '-'}</td>
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

export default ReportsPage