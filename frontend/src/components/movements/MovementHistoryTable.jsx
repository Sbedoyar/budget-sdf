import { ArrowDownToLine, ArrowUpFromLine, CalendarDays, History, Package } from 'lucide-react'

function MovementHistoryTable({
  movements,
  loading,
  hasActiveFilters,
}) {
  // Presenta las fechas del historial con formato local de Colombia.
  const formatMovementDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  return (
    <div className="movements-table-container">
      {loading ? (
        <div className="movements-state">
          <div className="movements-spinner" />
          <p>Cargando movimientos...</p>
        </div>
      ) : movements.length === 0 ? (
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
            {movements.map((movement) => (
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
  )
}

export default MovementHistoryTable
