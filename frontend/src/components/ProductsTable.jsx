import { AlertTriangle, CheckCircle2, CircleAlert, Package, PackageX, Pencil, RotateCcw, Trash2 } from 'lucide-react'

function ProductsTable({
  products,
  loading,
  hasActiveFilters,
  getStockStatus,
  reactivatingId,
  onEdit,
  onRetire,
  onReactivate,
}) {
  const getStatusLabel = (status) => {
    if (status === 'OUT_OF_STOCK') {
      return 'Sin stock'
    }

    if (status === 'LOW_STOCK') {
      return 'Bajo stock'
    }

    return 'Normal'
  }

  return (
    <div className="products-table-container">
      {loading ? (
        <div className="products-state">
          <div className="products-spinner" />
          <p>Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="products-state products-empty">
          <div className="products-empty-icon">
            <Package size={26} />
          </div>

          <h4>
            {hasActiveFilters
              ? 'No encontramos productos'
              : 'No hay productos registrados'}
          </h4>

          <p>
            {hasActiveFilters
              ? 'Prueba cambiando los filtros o el término de búsqueda.'
              : 'Registra el primer producto para comenzar a controlar el inventario.'}
          </p>
        </div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
              <th>Estado</th>
              <th className="products-actions-heading">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const status = getStockStatus(product)

              return (
                <tr
                  key={product.id}
                  className={
                    product.active === false
                      ? 'product-row-inactive'
                      : ''
                  }
                >
                  <td>
                    <div className="product-name-cell">
                      <div className="product-row-icon">
                        <Package size={17} />
                      </div>

                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.code}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="product-category-badge">
                      {product.category}
                    </span>
                  </td>

                  <td>{product.unitOfMeasure}</td>

                  <td>
                    <strong
                      className={
                        status === 'OUT_OF_STOCK'
                          ? 'product-stock-number product-stock-out'
                          : status === 'LOW_STOCK'
                            ? 'product-stock-number product-stock-low'
                            : 'product-stock-number product-stock-normal'
                      }
                    >
                      {product.currentStock}
                    </strong>
                  </td>

                  <td>{product.minimumStock}</td>

                  <td>
                    {product.active === false ? (
                      <span className="product-status-badge product-status-inactive">
                        <CircleAlert size={13} />
                        Inactivo
                      </span>
                    ) : (
                      <span
                        className={`product-status-badge product-status-${status.toLowerCase()}`}
                      >
                        {status === 'NORMAL' && (
                          <CheckCircle2 size={13} />
                        )}

                        {status === 'LOW_STOCK' && (
                          <AlertTriangle size={13} />
                        )}

                        {status === 'OUT_OF_STOCK' && (
                          <PackageX size={13} />
                        )}

                        {getStatusLabel(status)}
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="product-actions">
                      {product.active === false ? (
                        <button
                          type="button"
                          className="product-action-button product-reactivate-button"
                          onClick={() => onReactivate(product)}
                          disabled={reactivatingId === product.id}
                          aria-label={`Reactivar ${product.name}`}
                          title="Reactivar producto"
                        >
                          <RotateCcw size={16} />
                          <span>
                            {reactivatingId === product.id
                              ? 'Reactivando...'
                              : 'Reactivar'}
                          </span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="product-action-button product-edit-button"
                            onClick={() => onEdit(product)}
                            aria-label={`Editar ${product.name}`}
                            title="Editar producto"
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className="product-action-button product-delete-button"
                            onClick={() =>
                              onRetire(product)
                            }
                            aria-label={`Retirar ${product.name}`}
                            title="Retirar producto"
                          >
                            <Trash2 size={16} />
                            <span>Retirar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ProductsTable
