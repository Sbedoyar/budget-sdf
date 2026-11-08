import { Pencil, Plus, Save, X } from 'lucide-react'
import AppSelect from './AppSelect'

function ProductForm({
  form,
  categories,
  saving,
  codeInputRef,
  onFieldChange,
  onSubmit,
  onCancel,
}) {
  const { code, name, categoryId, unitOfMeasure, minimumStock, editingId } = form

  return (
    <section className="products-form-panel">
      <div className="products-panel-heading">
        <div className="products-panel-icon">
          {editingId ? <Pencil size={19} /> : <Plus size={19} />}
        </div>

        <div>
          <h3>
            {editingId ? 'Editar producto' : 'Registrar producto'}
          </h3>

          <p>
            {editingId
              ? 'Actualiza la información del producto seleccionado.'
              : 'Completa la información para agregar un nuevo producto al inventario.'}
          </p>
        </div>

        {editingId && (
          <span className="products-editing-badge">
            Editando #{editingId}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <div className="product-form-grid">
          <div className="form-group">
            <label htmlFor="code" className="form-label">
              Código
            </label>

            <input
              ref={codeInputRef}
              id="code"
              className="form-input products-form-input"
              type="text"
              placeholder="Ej. P001"
              value={code}
              onChange={(event) => onFieldChange('code', event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>

            <input
              id="name"
              className="form-input products-form-input"
              type="text"
              placeholder="Ej. Coca Cola 1.5L"
              value={name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Categoría
            </label>

            <AppSelect
              id="category"
              className="form-input products-form-input"
              value={categoryId}
              onChange={(event) => onFieldChange('categoryId', event.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </AppSelect>
          </div>

          <div className="form-group">
            <label
              htmlFor="unitOfMeasure"
              className="form-label"
            >
              Unidad de medida
            </label>

            <input
              id="unitOfMeasure"
              className="form-input products-form-input"
              type="text"
              placeholder="Ej. Unidad, Caja, Paquete"
              value={unitOfMeasure}
              onChange={(event) =>
                onFieldChange('unitOfMeasure', event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="minimumStock"
              className="form-label"
            >
              Stock mínimo
            </label>

            <input
              id="minimumStock"
              className="form-input products-form-input"
              type="number"
              min="0"
              placeholder="Ej. 5"
              value={minimumStock}
              onChange={(event) =>
                onFieldChange('minimumStock', event.target.value)
              }
              required
            />

            <span className="products-field-help">
              Define cuándo el sistema debe mostrar una alerta de stock.
            </span>
          </div>
        </div>

        <div className="products-form-actions">
          <button
            type="submit"
            className="products-save-button"
            disabled={saving}
          >
            {editingId ? (
              <Save size={17} />
            ) : (
              <Plus size={17} />
            )}

            {saving
              ? 'Guardando...'
              : editingId
                ? 'Guardar cambios'
                : 'Crear producto'}
          </button>

          {editingId && (
            <button
              type="button"
              className="products-cancel-button"
              onClick={onCancel}
              disabled={saving}
            >
              <X size={17} />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default ProductForm
