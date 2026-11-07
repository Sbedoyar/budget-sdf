import { ArrowDownToLine, ArrowUpFromLine, CalendarDays, History, Package } from "lucide-react";

function MovementHistoryReportTable({ movements, hasMovements }) {
  return (
    <div className="report-table-container">
      {movements.length === 0 ? (
        <div className="report-empty-state">
          <History size={25} />

          <h4>No encontramos movimientos</h4>

          <p>
            {!hasMovements
              ? "No existen movimientos para los filtros seleccionados."
              : "Prueba cambiando el término de búsqueda."}
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
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>
                  <div className="report-date-cell">
                    <CalendarDays size={14} />

                    <span>{movement.formattedDate}</span>
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
                      movement.type === "ENTRADA"
                        ? "report-movement-badge report-movement-entry"
                        : "report-movement-badge report-movement-exit"
                    }
                  >
                    {movement.type === "ENTRADA" ? (
                      <ArrowDownToLine size={12} />
                    ) : (
                      <ArrowUpFromLine size={12} />
                    )}

                    {movement.type === "ENTRADA" ? "Entrada" : "Salida"}
                  </span>
                </td>

                <td>
                  <strong
                    className={
                      movement.type === "ENTRADA"
                        ? "report-number-entry"
                        : "report-number-exit"
                    }
                  >
                    {movement.type === "ENTRADA" ? "+" : "-"}

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
                    {movement.observation || "Sin observación"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MovementHistoryReportTable;
