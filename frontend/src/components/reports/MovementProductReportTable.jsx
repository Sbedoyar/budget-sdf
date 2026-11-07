import { Package } from "lucide-react";

function MovementProductReportTable({ products, hasProductMovements }) {
  return (
    <div className="report-table-container">
      {products.length === 0 ? (
        <div className="report-empty-state">
          <Package size={25} />

          <h4>No encontramos productos</h4>

          <p>
            {!hasProductMovements
              ? "No hay productos con movimientos para los filtros seleccionados."
              : "Prueba con otro código o nombre de producto."}
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
            {products.map((product) => (
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
                        ? "report-balance report-balance-negative"
                        : "report-balance report-balance-positive"
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
  );
}

export default MovementProductReportTable;
