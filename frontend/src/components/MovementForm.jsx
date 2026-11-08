import { ArrowDownToLine, ArrowUpFromLine, CircleAlert, Package } from 'lucide-react'
import AppSelect from './AppSelect'

function MovementForm({
  form,
  products,
  selectedProduct,
  exceedsAvailableStock,
  saving,
  productSelectRef,
  onFieldChange,
  onSubmit,
}) {
  const { productId, type, quantity, observation } = form

  const requestedQuantity = Number(quantity || 0)
  const resultingStockPreview =
    selectedProduct && requestedQuantity > 0
      ? type === 'ENTRADA'
        ? selectedProduct.currentStock + requestedQuantity
        : type === 'SALIDA'
          ? selectedProduct.currentStock - requestedQuantity
          : selectedProduct.currentStock
      : selectedProduct?.currentStock

  return (
    <section className="movements-form-panel">
      <div className="movements-panel-heading">
        <div
          className={
            type === 'SALIDA'
              ? 'movements-panel-icon movements-panel-icon-exit'
              : type === 'ENTRADA'
                ? 'movements-panel-icon movements-panel-icon-entry'
                : 'movements-panel-icon'
          }
        >
          {type === 'SALIDA' ? (
            <ArrowUpFromLine size={19} />
          ) : (
            <ArrowDownToLine size={19} />
          )}
        </div>

        <div>
          <h3>Registrar movimiento</h3>
          <p>
            Selecciona el producto y registra una entrada o salida de inventario.
          </p>
        </div>

        {type && (
          <span
            className={
              type === 'ENTRADA'
                ? 'movements-type-indicator movements-type-entry'
                : 'movements-type-indicator movements-type-exit'
            }
          >
            {type === 'ENTRADA' ? (
              <ArrowDownToLine size={14} />
            ) : (
              <ArrowUpFromLine size={14} />
            )}

            {type === 'ENTRADA' ? 'Entrada' : 'Salida'}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <div className="movement-form-grid">
          <div className="form-group">
            <label htmlFor="product" className="form-label">
              Producto
            </label>

            <AppSelect
              ref={productSelectRef}
              id="product"
              className="form-input movements-form-input"
              value={productId}
              onChange={(event) =>
                onFieldChange('productId', event.target.value)
              }
              required
            >
              <option value="">Selecciona un producto</option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.code} - {product.name}
                </option>
              ))}
            </AppSelect>
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Tipo de movimiento
            </label>

            <AppSelect
              id="type"
              className="form-input movements-form-input"
              value={type}
              onChange={(event) =>
                onFieldChange('type', event.target.value)
              }
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </AppSelect>
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">
              Cantidad
            </label>

            <input
              id="quantity"
              className="form-input movements-form-input"
              type="number"
              min="1"
              value={quantity}
              placeholder="Ej. 10"
              onChange={(event) =>
                onFieldChange('quantity', event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observation" className="form-label">
              Observación
            </label>

            <input
              id="observation"
              className="form-input movements-form-input"
              type="text"
              value={observation}
              onChange={(event) =>
                onFieldChange('observation', event.target.value)
              }
              placeholder="Ej. Compra a proveedor"
            />
          </div>
        </div>

        {selectedProduct && (
          <div className="movement-stock-preview">
            <div className="movement-stock-product">
              <div className="movement-stock-icon">
                <Package size={18} />
              </div>

              <div>
                <strong>{selectedProduct.name}</strong>
                <span>{selectedProduct.code}</span>
              </div>
            </div>

            <div className="movement-stock-values">
              <div>
                <span>Stock actual</span>
                <strong>{selectedProduct.currentStock}</strong>
              </div>

              <div className="movement-stock-arrow">
                {type === 'SALIDA' ? (
                  <ArrowUpFromLine size={18} />
                ) : (
                  <ArrowDownToLine size={18} />
                )}
              </div>

              <div>
                <span>Stock resultante</span>
                <strong
                  className={
                    exceedsAvailableStock
                      ? 'movement-result-danger'
                      : ''
                  }
                >
                  {resultingStockPreview}
                </strong>
              </div>
            </div>
          </div>
        )}

        {exceedsAvailableStock && (
          <div className="movement-stock-warning">
            <CircleAlert size={16} />
            La cantidad solicitada supera el stock disponible.
          </div>
        )}

        <div className="movements-form-actions">
          <button
            type="submit"
            className={
              type === 'SALIDA'
                ? 'movements-submit-button movements-submit-exit'
                : 'movements-submit-button'
            }
            disabled={saving || exceedsAvailableStock}
          >
            {type === 'SALIDA' ? (
              <ArrowUpFromLine size={17} />
            ) : (
              <ArrowDownToLine size={17} />
            )}

            {saving ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default MovementForm
