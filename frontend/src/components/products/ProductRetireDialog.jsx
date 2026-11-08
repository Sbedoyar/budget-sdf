import { Trash2 } from 'lucide-react'

function ProductRetireDialog({
  productName,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="product-modal-backdrop"
      role="presentation"
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
      >
        <div className="product-modal-danger-icon">
          <Trash2 size={23} />
        </div>

        <h3 id="delete-product-title">
          Retirar producto
        </h3>

        <p>
          ¿Deseas retirar{' '}
          <strong>{productName}</strong> del catálogo activo?
        </p>

        <span>
          Si tiene movimientos registrados, se desactivará para
          conservar su historial y podrás reactivarlo después. Si no
          tiene movimientos, se eliminará definitivamente.
        </span>

        <div className="product-modal-actions">
          <button
            type="button"
            className="product-modal-cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="product-modal-delete"
            onClick={onConfirm}
            disabled={deleting}
          >
            <Trash2 size={16} />
            {deleting ? 'Procesando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductRetireDialog
