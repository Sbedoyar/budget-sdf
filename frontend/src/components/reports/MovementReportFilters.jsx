import { ArrowDownToLine, CalendarDays, Check, ChevronDown, Filter, Package, RefreshCw, Search, X } from "lucide-react";
import AppSelect from "../AppSelect";

function MovementReportFilters({
  movementFilters,
  periodOptions,
  filteringMovements,
  hasAppliedMovementFilters,
  activeMovementFilterCount,
  activeMovementFilterChips,
  productSelectorRef,
  productSelectorOpen,
  productSelectorLabel,
  productSelectorSearch,
  filteredMovementProductOptions,
  onPeriodChange,
  onDateChange,
  onTypeChange,
  onToggleProductSelector,
  onProductSearchChange,
  onSelectAllProducts,
  onToggleProduct,
  onCloseProductSelector,
  onClear,
  onApply,
}) {
  return (
    <article className="report-advanced-filter-card">
      <div className="report-advanced-filter-heading">
        <div className="report-advanced-filter-title">
          <div className="report-advanced-filter-icon">
            <Filter size={18} />
          </div>

          <div>
            <h4>Filtros del reporte</h4>
            <p>
              Define el período, tipo de movimiento y producto que quieres
              analizar.
            </p>
          </div>
        </div>

        <span
          className={
            hasAppliedMovementFilters
              ? "report-filter-state report-filter-state-active"
              : "report-filter-state"
          }
        >
          {hasAppliedMovementFilters
            ? `${activeMovementFilterCount} ${
                activeMovementFilterCount === 1
                  ? "filtro activo"
                  : "filtros activos"
              }`
            : "Sin filtros"}
        </span>
      </div>

      <div className="report-period-block">
        <span className="report-filter-label">Período rápido</span>

        <div className="report-period-buttons">
          {periodOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={
                movementFilters.period === option.value
                  ? "report-period-button report-period-button-active"
                  : "report-period-button"
              }
              onClick={() => onPeriodChange(option.value)}
              disabled={filteringMovements}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="report-advanced-filter-grid">
        <label className="report-filter-field">
          <span>Desde</span>
          <div className="report-date-input">
            <CalendarDays size={15} />
            <input
              type="date"
              value={movementFilters.from}
              onChange={(event) => onDateChange("from", event.target.value)}
            />
          </div>
        </label>

        <label className="report-filter-field">
          <span>Hasta</span>
          <div className="report-date-input">
            <CalendarDays size={15} />
            <input
              type="date"
              value={movementFilters.to}
              onChange={(event) => onDateChange("to", event.target.value)}
            />
          </div>
        </label>

        <label className="report-filter-field">
          <span>Tipo de movimiento</span>
          <div className="report-select-input">
            <ArrowDownToLine size={15} />
            <AppSelect
              value={movementFilters.type}
              onChange={(event) => onTypeChange(event.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
            </AppSelect>
          </div>
        </label>

        <div className="report-filter-field">
          <span>Productos</span>

          <div
            className="report-product-multiselect"
            ref={productSelectorRef}
          >
            <button
              type="button"
              className={
                productSelectorOpen
                  ? "report-product-selector-button report-product-selector-button-open"
                  : "report-product-selector-button"
              }
              aria-expanded={productSelectorOpen}
              aria-haspopup="listbox"
              onClick={onToggleProductSelector}
            >
              <Package size={15} />

              <span className="report-product-selector-value">
                {productSelectorLabel}
              </span>

              <ChevronDown
                size={15}
                className={
                  productSelectorOpen
                    ? "report-product-selector-chevron report-product-selector-chevron-open"
                    : "report-product-selector-chevron"
                }
              />
            </button>

            {productSelectorOpen && (
              <div
                className="report-product-selector-menu"
                role="listbox"
                aria-label="Seleccionar productos del reporte"
                aria-multiselectable="true"
              >
                <div className="report-product-selector-search">
                  <Search size={14} />

                  <input
                    type="search"
                    value={productSelectorSearch}
                    placeholder="Buscar producto o código..."
                    aria-label="Buscar productos para filtrar"
                    onChange={(event) => onProductSearchChange(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  role="option"
                  aria-selected={movementFilters.productIds.length === 0}
                  className={
                    movementFilters.productIds.length === 0
                      ? "report-product-option report-product-option-selected"
                      : "report-product-option"
                  }
                  onClick={onSelectAllProducts}
                >
                  <span className="report-product-option-check">
                    {movementFilters.productIds.length === 0 && (
                      <Check size={12} />
                    )}
                  </span>

                  <span className="report-product-option-copy">
                    <strong>Todos los productos</strong>
                    <small>No limitar el reporte por producto</small>
                  </span>
                </button>

                <div className="report-product-selector-divider" />

                <div className="report-product-selector-options">
                  {filteredMovementProductOptions.length === 0 ? (
                    <div className="report-product-selector-empty">
                      No encontramos productos con esa búsqueda.
                    </div>
                  ) : (
                    filteredMovementProductOptions.map((product) => {
                      const isSelected = movementFilters.productIds.some(
                        (productId) =>
                          String(productId) === String(product.productId),
                      );

                      return (
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={
                            isSelected
                              ? "report-product-option report-product-option-selected"
                              : "report-product-option"
                          }
                          key={product.productId}
                          onClick={() =>
                            onToggleProduct(product.productId)
                          }
                        >
                          <span className="report-product-option-check">
                            {isSelected && <Check size={12} />}
                          </span>

                          <span className="report-product-option-copy">
                            <strong>{product.name}</strong>
                            <small>
                              {product.code}
                              {product.active === false && (
                                <span className="report-product-inactive-label">
                                  Inactivo
                                </span>
                              )}
                            </small>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="report-product-selector-footer">
                  <span>
                    {movementFilters.productIds.length === 0
                      ? "Todos incluidos"
                      : `${movementFilters.productIds.length} ${
                          movementFilters.productIds.length === 1
                            ? "producto seleccionado"
                            : "productos seleccionados"
                        }`}
                  </span>

                  <button
                    type="button"
                    onClick={onCloseProductSelector}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="report-filter-footer">
        <div className="report-filter-help">
          <CalendarDays size={15} />
          <span>
            Para consultar un solo día, usa la misma fecha en “Desde” y
            “Hasta”.
          </span>
        </div>

        <div className="report-filter-actions">
          <button
            type="button"
            className="report-filter-reset-button"
            onClick={onClear}
            disabled={filteringMovements}
          >
            <X size={15} />
            Limpiar filtros
          </button>

          <button
            type="button"
            className="report-filter-apply-button"
            onClick={onApply}
            disabled={filteringMovements}
          >
            <RefreshCw
              size={15}
              className={filteringMovements ? "reports-refresh-spin" : ""}
            />
            {filteringMovements ? "Aplicando..." : "Aplicar filtros"}
          </button>
        </div>
      </div>

      {hasAppliedMovementFilters && (
        <div className="report-active-filter-row">
          <span className="report-active-filter-title">Vista actual</span>

          <div className="report-active-filter-chips">
            {activeMovementFilterChips.map((chip) => (
              <span className="report-active-filter-chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default MovementReportFilters;
