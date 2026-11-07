import { Filter, Search, X } from "lucide-react";
import AppSelect from "../AppSelect";

function InventoryReportFilters({
  inventorySearch,
  inventoryStatusFilter,
  hasInventoryFilters,
  onSearchChange,
  onStatusChange,
  onClear,
}) {
  return (
    <div className="report-toolbar">
      <div className="report-search">
        <Search size={16} />

        <input
          type="search"
          value={inventorySearch}
          placeholder="Buscar código, producto o categoría..."
          aria-label="Buscar en reporte de inventario"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="report-filter">
        <Filter size={15} />

        <AppSelect
          value={inventoryStatusFilter}
          aria-label="Filtrar inventario por estado"
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Todos los estados</option>

          <option value="NORMAL">Normal</option>

          <option value="LOW_STOCK">Bajo stock</option>

          <option value="OUT_OF_STOCK">Sin stock</option>
        </AppSelect>
      </div>

      {hasInventoryFilters && (
        <button
          type="button"
          className="report-clear-button"
          onClick={onClear}
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}

export default InventoryReportFilters;
