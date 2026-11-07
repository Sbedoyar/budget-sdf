import { AlertTriangle, CheckCircle2, Package, PackageX } from "lucide-react";

function InventoryReportTable({ products }) {
  return (
    <div className="report-table-container">
      {products.length === 0 ? (
        <div className="report-empty-state">
          <Package size={25} />

          <h4>No encontramos productos</h4>

          <p>
            Prueba cambiando el término de búsqueda o el filtro
            seleccionado.
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

                <td>{product.category}</td>

                <td>{product.unitOfMeasure}</td>

                <td>
                  <strong
                    className={
                      product.stockStatus === "OUT_OF_STOCK"
                        ? "report-stock-value report-stock-out"
                        : product.stockStatus === "LOW_STOCK"
                          ? "report-stock-value report-stock-low"
                          : "report-stock-value report-stock-normal"
                    }
                  >
                    {product.currentStock}
                  </strong>
                </td>

                <td>{product.minimumStock}</td>

                <td>
                  <span
                    className={product.stockStatusClass}
                  >
                    {product.stockStatus === "NORMAL" && (
                      <CheckCircle2 size={12} />
                    )}

                    {product.stockStatus === "LOW_STOCK" && (
                      <AlertTriangle size={12} />
                    )}

                    {product.stockStatus === "OUT_OF_STOCK" && (
                      <PackageX size={12} />
                    )}

                    {product.stockStatusLabel}
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

export default InventoryReportTable;
