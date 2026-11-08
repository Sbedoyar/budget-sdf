import { ChevronDown, Download, FileSpreadsheet, Filter } from "lucide-react";

function ReportExportMenu({
  exportMenuRef,
  exportMenuOpen,
  exportingMode,
  refreshing,
  onToggle,
  onExport,
}) {
  return (
    <div className="reports-export-wrapper" ref={exportMenuRef}>
      <button
        type="button"
        className={
          exportMenuOpen
            ? "reports-export-button reports-export-button-open"
            : "reports-export-button"
        }
        aria-expanded={exportMenuOpen}
        aria-haspopup="menu"
        disabled={Boolean(exportingMode) || refreshing}
        onClick={onToggle}
      >
        <FileSpreadsheet size={17} />
        <span>
          {exportingMode ? "Generando Excel..." : "Exportar Excel"}
        </span>
        <ChevronDown
          size={15}
          className={
            exportMenuOpen
              ? "reports-export-chevron reports-export-chevron-open"
              : "reports-export-chevron"
          }
        />
      </button>

      {exportMenuOpen && !exportingMode && (
        <div
          className="reports-export-menu"
          role="menu"
          aria-label="Opciones de exportación a Excel"
        >
          <button
            type="button"
            role="menuitem"
            className="reports-export-option"
            onClick={() => onExport("current")}
          >
            <div className="reports-export-option-icon">
              <Filter size={16} />
            </div>

            <div>
              <strong>Exportar vista actual</strong>
              <span>Respeta los filtros aplicados.</span>
            </div>
          </button>

          <div className="reports-export-menu-divider" />

          <button
            type="button"
            role="menuitem"
            className="reports-export-option"
            onClick={() => onExport("full")}
          >
            <div className="reports-export-option-icon">
              <Download size={16} />
            </div>

            <div>
              <strong>Exportar reporte completo</strong>
              <span>Incluye todos los movimientos.</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportExportMenu;
