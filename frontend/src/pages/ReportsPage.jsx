import { getErrorMessage } from "../utils/getErrorMessage";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Filter,
  FileSpreadsheet,
  History,
  Download,
  PackageX,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import {
  getInventoryReport,
  getMovementReport,
} from "../services/reportService";
import InventoryReportFilters from "../components/reports/InventoryReportFilters";
import MovementReportFilters from "../components/reports/MovementReportFilters";
import ReportResultSearch from "../components/reports/ReportResultSearch";
import InventoryReportSummary from "../components/reports/InventoryReportSummary";
import InventoryStockChart from "../components/reports/InventoryStockChart";
import MovementUnitsChart from "../components/reports/MovementUnitsChart";
import MovementReportSummary from "../components/reports/MovementReportSummary";
import InventoryReportTable from "../components/reports/InventoryReportTable";
import MovementProductReportTable from "../components/reports/MovementProductReportTable";
import MovementHistoryReportTable from "../components/reports/MovementHistoryReportTable";
import {
  initialInventoryReportFilters,
  inventoryReportFiltersReducer,
} from "../reducers/inventoryReportFiltersReducer";
import {
  emptyMovementFilters,
  initialMovementReportFilters,
  movementReportFiltersReducer,
} from "../reducers/movementReportFiltersReducer";
import { getProducts } from "../services/productService";

import { exportReportsToExcel } from "../utils/reportExcelExporter";

import "../styles/pages/reports.css";

const PERIOD_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "custom", label: "Personalizado" },
];

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildMovementRequestFilters = (filters) => {
  const requestFilters = {};

  if (filters.from) {
    requestFilters.from = filters.from;
  }

  if (filters.to) {
    requestFilters.to = filters.to;
  }

  if (filters.type) {
    requestFilters.type = filters.type;
  }

  if (Array.isArray(filters.productIds) && filters.productIds.length > 0) {
    requestFilters.productIds = filters.productIds;
  }

  return requestFilters;
};

// Presenta reportes de inventario y movimientos con filtros y agregados calculados localmente.

function ReportsPage() {
  const [inventoryReport, setInventoryReport] = useState(null);

  const [movementReport, setMovementReport] = useState(null);
  const [movementProductCatalog, setMovementProductCatalog] = useState([]);

  const [{ inventorySearch, inventoryStatusFilter }, dispatchInventoryFilters] = useReducer(
    inventoryReportFiltersReducer,
    initialInventoryReportFilters,
  );
  const [movementFilterState, dispatchMovementFilters] = useReducer(
    movementReportFiltersReducer,
    initialMovementReportFilters,
  );
  const {
    movementFilters,
    appliedMovementFilters,
    productMovementSearch,
    historySearch,
  } = movementFilterState;

  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [productSelectorSearch, setProductSelectorSearch] = useState("");
  const productSelectorRef = useRef(null);

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingMode, setExportingMode] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const exportMenuRef = useRef(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [filteringMovements, setFilteringMovements] = useState(false);

  const [error, setError] = useState("");

  // Solicita en paralelo los reportes de inventario y movimientos al cargar la página.

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      try {
        const [
          inventoryData,
          movementData,
          productCatalogData,
        ] = await Promise.all([
          getInventoryReport(),

          getMovementReport(),

          getProducts(true),
        ]);

        if (!cancelled) {
          setInventoryReport(inventoryData);

          setMovementReport(movementData);

          setMovementProductCatalog(productCatalogData);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            getErrorMessage(error, "No fue posible cargar los reportes"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cierra los menús desplegables al hacer clic fuera o presionar Escape.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        productSelectorRef.current &&
        !productSelectorRef.current.contains(event.target)
      ) {
        setProductSelectorOpen(false);
      }

      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setExportMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProductSelectorOpen(false);
        setExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Vuelve a consultar ambos reportes respetando los filtros aplicados al reporte de movimientos.
  const refreshReports = async () => {
    try {
      setRefreshing(true);
      setError("");

      const [
        inventoryData,
        movementData,
        productCatalogData,
      ] = await Promise.all([
        getInventoryReport(),
        getMovementReport(buildMovementRequestFilters(appliedMovementFilters)),
        getProducts(true),
      ]);

      setInventoryReport(inventoryData);
      setMovementReport(movementData);
      setMovementProductCatalog(productCatalogData);
    } catch (error) {
      setError(
        getErrorMessage(error, "No fue posible actualizar los reportes"),
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Traduce los estados de stock del backend a etiquetas visibles en español.

  const getStockStatusLabel = (status) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "Sin stock";

      case "LOW_STOCK":
        return "Bajo stock";

      case "NORMAL":
        return "Normal";

      default:
        return status;
    }
  };

  // Asocia cada estado recibido con la clase visual usada en sus indicadores.

  const getStockStatusClass = (status) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "report-status-badge report-status-out";

      case "LOW_STOCK":
        return "report-status-badge report-status-low";

      case "NORMAL":
        return "report-status-badge report-status-normal";

      default:
        return "report-status-badge";
    }
  };

  // Prepara los totales por estado para el gráfico circular de inventario.

  const inventoryStatusData = useMemo(() => {
    if (!inventoryReport) {
      return [];
    }

    return [
      {
        name: "Normal",

        value: inventoryReport.summary.productsWithNormalStock,

        color: "#10b981",
      },

      {
        name: "Bajo stock",

        value: inventoryReport.summary.productsWithLowStock,

        color: "#f59e0b",
      },

      {
        name: "Sin stock",

        value: inventoryReport.summary.productsOutOfStock,

        color: "#ef4444",
      },
    ];
  }, [inventoryReport]);

  // Busca productos por código, nombre o categoría y aplica el filtro de estado.

  const filteredInventoryProducts = useMemo(() => {
    if (!inventoryReport) {
      return [];
    }

    const query = inventorySearch.trim().toLowerCase();

    return inventoryReport.products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.code).toLowerCase().includes(query) ||
        String(product.name).toLowerCase().includes(query) ||
        String(product.category).toLowerCase().includes(query);

      const matchesStatus =
        !inventoryStatusFilter || product.stockStatus === inventoryStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventoryReport, inventorySearch, inventoryStatusFilter]);

  // Usa el catálogo administrativo para conservar en los filtros los productos inactivos con historial.
  const movementProductOptions = useMemo(() => {
    return movementProductCatalog
      .map((product) => ({
        productId: product.id,
        code: product.code,
        name: product.name,
        active: product.active !== false,
      }))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "es"),
      );
  }, [movementProductCatalog]);

  // Filtra las opciones visibles dentro del selector múltiple de productos.
  const filteredMovementProductOptions = useMemo(() => {
    const query = productSelectorSearch.trim().toLowerCase();

    if (!query) {
      return movementProductOptions;
    }

    return movementProductOptions.filter((product) => {
      return (
        String(product.code).toLowerCase().includes(query) ||
        String(product.name).toLowerCase().includes(query)
      );
    });
  }, [movementProductOptions, productSelectorSearch]);

  // Obtiene los productos seleccionados en el filtro antes de aplicar la consulta.
  const selectedMovementProducts = useMemo(() => {
    return movementProductOptions.filter((product) =>
      movementFilters.productIds.some(
        (productId) => String(productId) === String(product.productId),
      ),
    );
  }, [movementFilters.productIds, movementProductOptions]);

  const productSelectorLabel =
    selectedMovementProducts.length === 0
      ? "Todos los productos"
      : selectedMovementProducts.length === 1
        ? `${selectedMovementProducts[0].code} · ${selectedMovementProducts[0].name}`
        : `${selectedMovementProducts.length} productos seleccionados`;

  // Selecciona los productos con mayor actividad para comparar entradas y salidas.

  const movementChartData = useMemo(() => {
    if (!movementReport) {
      return [];
    }

    return [...movementReport.byProduct]

      .sort(
        (a, b) =>
          b.inboundUnits + b.outboundUnits - (a.inboundUnits + a.outboundUnits),
      )

      .slice(0, 8)

      .map((product) => ({
        name: product.name,

        entradas: product.inboundUnits,

        salidas: product.outboundUnits,
      }));
  }, [movementReport]);

  // Busca por código o nombre dentro del resumen de movimientos por producto.

  const filteredMovementProducts = useMemo(() => {
    if (!movementReport) {
      return [];
    }

    const query = productMovementSearch.trim().toLowerCase();

    return movementReport.byProduct.filter((product) => {
      return (
        !query ||
        String(product.code).toLowerCase().includes(query) ||
        String(product.name).toLowerCase().includes(query)
      );
    });
  }, [movementReport, productMovementSearch]);

  // Filtra localmente el historial ya consultado por producto, código u observación.
  const filteredMovementHistory = useMemo(() => {
    if (!movementReport) {
      return [];
    }

    const query = historySearch.trim().toLowerCase();

    return movementReport.movements.filter((movement) => {
      const observation = movement.observation || "";

      return (
        !query ||
        String(movement.productCode).toLowerCase().includes(query) ||
        String(movement.productName).toLowerCase().includes(query) ||
        observation.toLowerCase().includes(query)
      );
    });
  }, [movementReport, historySearch]);

  // Formatea las fechas del reporte según la configuración regional de Colombia.
  const formatMovementDate = (date) => {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const formatFilterDate = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
    }).format(new Date(`${date}T00:00:00`));
  };

  /**
   * Solicita al backend el reporte con el conjunto de filtros indicado.
   * Las búsquedas internas se limpian para mostrar de inmediato el resultado nuevo.
   */
  const applyMovementFilters = async (filters = movementFilters) => {
    if (filters.from && filters.to && filters.from > filters.to) {
      setError("La fecha inicial no puede ser posterior a la fecha final");
      return;
    }

    try {
      setFilteringMovements(true);
      setError("");

      const movementData = await getMovementReport(
        buildMovementRequestFilters(filters),
      );

      setMovementReport(movementData);
      dispatchMovementFilters({ type: "APPLY_FILTERS", filters });
    } catch (error) {
      setError(
        getErrorMessage(error, "No fue posible aplicar los filtros del reporte"),
      );
    } finally {
      setFilteringMovements(false);
    }
  };

  /**
   * Aplica accesos rápidos de fecha conservando los filtros de tipo y producto.
   * El período personalizado solo habilita la edición manual de fechas.
   */
  const handlePeriodPreset = (period) => {
    const today = new Date();
    const todayValue = toInputDate(today);
    let nextFilters = {
      ...movementFilters,
      period,
    };

    if (period === "custom") {
      dispatchMovementFilters({ type: "UPDATE_DRAFT", filters: nextFilters });
      return;
    }

    if (period === "all") {
      nextFilters = {
        ...nextFilters,
        from: "",
        to: "",
      };
    }

    if (period === "today") {
      nextFilters = {
        ...nextFilters,
        from: todayValue,
        to: todayValue,
      };
    }

    if (period === "week") {
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const distanceToMonday = day === 0 ? -6 : 1 - day;

      weekStart.setDate(weekStart.getDate() + distanceToMonday);

      nextFilters = {
        ...nextFilters,
        from: toInputDate(weekStart),
        to: todayValue,
      };
    }

    if (period === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      nextFilters = {
        ...nextFilters,
        from: toInputDate(monthStart),
        to: todayValue,
      };
    }

    dispatchMovementFilters({ type: "UPDATE_DRAFT", filters: nextFilters });
    applyMovementFilters(nextFilters);
  };

  // Agrega o quita un producto del filtro múltiple sin aplicar todavía la consulta.
  const toggleMovementProduct = (productId) => {
    dispatchMovementFilters({ type: "TOGGLE_PRODUCT", productId });
  };

  // La lista vacía representa "todos los productos" para el backend.
  const selectAllMovementProducts = () => {
    dispatchMovementFilters({ type: "UPDATE_DRAFT", filters: { productIds: [] } });
  };

  const clearMovementFilters = () => {
    dispatchMovementFilters({ type: "RESET_DRAFT" });
    setProductSelectorOpen(false);
    setProductSelectorSearch("");
    applyMovementFilters(emptyMovementFilters);
  };

  const hasInventoryFilters = inventorySearch || inventoryStatusFilter;

  const hasHistoryFilters = Boolean(historySearch);

  const selectedAppliedProducts = movementProductOptions.filter((product) =>
    appliedMovementFilters.productIds?.some(
      (productId) => String(productId) === String(product.productId),
    ),
  );

  const hasAppliedMovementFilters = Boolean(
    appliedMovementFilters.from ||
    appliedMovementFilters.to ||
    appliedMovementFilters.type ||
    selectedAppliedProducts.length > 0,
  );

  const activeMovementFilterCount = [
    appliedMovementFilters.from,
    appliedMovementFilters.to,
    appliedMovementFilters.type,
    selectedAppliedProducts.length > 0,
  ].filter(Boolean).length;

  const activeMovementFilterChips = [];

  if (appliedMovementFilters.from) {
    activeMovementFilterChips.push(
      `Desde ${formatFilterDate(appliedMovementFilters.from)}`,
    );
  }

  if (appliedMovementFilters.to) {
    activeMovementFilterChips.push(
      `Hasta ${formatFilterDate(appliedMovementFilters.to)}`,
    );
  }

  if (appliedMovementFilters.type) {
    activeMovementFilterChips.push(
      appliedMovementFilters.type === "ENTRADA"
        ? "Solo entradas"
        : "Solo salidas",
    );
  }

  if (selectedAppliedProducts.length === 1) {
    const [product] = selectedAppliedProducts;

    activeMovementFilterChips.push(`${product.code} · ${product.name}`);
  } else if (
    selectedAppliedProducts.length > 1 &&
    selectedAppliedProducts.length <= 3
  ) {
    selectedAppliedProducts.forEach((product) => {
      activeMovementFilterChips.push(`${product.code} · ${product.name}`);
    });
  } else if (selectedAppliedProducts.length > 3) {
    activeMovementFilterChips.push(
      `${selectedAppliedProducts.length} productos seleccionados`,
    );
  }

  /**
   * Genera un archivo Excel con la vista filtrada actual o con el reporte completo.
   * El reporte completo se vuelve a consultar para no depender de los filtros visibles.
   */
  const handleExcelExport = async (mode) => {
    if (!inventoryReport || !movementReport) {
      return;
    }

    try {
      setExportingMode(mode);
      setExportMenuOpen(false);
      setExportMessage("");
      setError("");

      if (mode === "current") {
        await exportReportsToExcel({
          inventoryReport,
          movementReport,
          productCatalog: movementProductCatalog,
          filters: appliedMovementFilters,
          mode: "filtered",
        });

        setExportMessage("La vista actual se exportó correctamente a Excel.");
        return;
      }

      const [completeInventoryReport, completeMovementReport] =
        await Promise.all([getInventoryReport(), getMovementReport()]);

      await exportReportsToExcel({
        inventoryReport: completeInventoryReport,
        movementReport: completeMovementReport,
        productCatalog: movementProductCatalog,
        filters: emptyMovementFilters,
        mode: "full",
      });

      setExportMessage("El reporte completo se exportó correctamente a Excel.");
    } catch (exportError) {
      const exportMessage = exportError?.message;
      const readableMessage =
        typeof exportMessage === "string" &&
        exportMessage.trim() &&
        exportMessage.trim().toLowerCase() !== "network error";

      setError(
        getErrorMessage(
          exportError,
          readableMessage
            ? exportMessage
            : "No fue posible generar el archivo Excel",
        ),
      );
    } finally {
      setExportingMode("");
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="reports-loading-spinner" />

        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="reports-heading">
        <div className="reports-title-row">
          <div className="reports-title-icon">
            <BarChart3 size={23} />
          </div>

          <div>
            <h2 className="page-title">Reportes</h2>

            <p className="page-subtitle">
              Analiza el estado del inventario y el comportamiento de sus
              movimientos.
            </p>
          </div>
        </div>

        <div className="reports-heading-actions">
          <button
            type="button"
            className="reports-refresh-button"
            onClick={refreshReports}
            disabled={refreshing || Boolean(exportingMode)}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "reports-refresh-spin" : ""}
            />
            {refreshing ? "Actualizando..." : "Actualizar reportes"}
          </button>

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
              onClick={() => setExportMenuOpen((current) => !current)}
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
                  onClick={() => handleExcelExport("current")}
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
                  onClick={() => handleExcelExport("full")}
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
        </div>
      </div>

      {error && (
        <div className="reports-feedback-error">
          <CircleAlert size={18} />

          <span>{error}</span>
        </div>
      )}

      {exportMessage && (
        <div className="reports-feedback-success">
          <CheckCircle2 size={18} />
          <span>{exportMessage}</span>
        </div>
      )}

      {inventoryReport && (
        <section className="report-section">
          <div className="report-section-heading">
            <div className="report-section-title">
              <div className="report-section-icon">
                <Warehouse size={20} />
              </div>

              <div>
                <h3>Reporte de inventario</h3>

                <p>Resumen actual del stock y estado de todos los productos.</p>
              </div>
            </div>

            <span className="report-section-chip">
              <Activity size={14} />
              Estado actual
            </span>
          </div>

          <InventoryReportSummary summary={inventoryReport.summary} />

          <div className="report-visual-grid">
            <InventoryStockChart
              data={inventoryStatusData}
              totalProducts={inventoryReport.summary.totalProducts}
            />

            <article className="report-health-card">
              <div className="report-card-heading">
                <div>
                  <h4>Lectura rápida</h4>

                  <p>Indicadores clave para revisar el inventario.</p>
                </div>

                <CheckCircle2 size={19} />
              </div>

              <div className="report-health-list">
                <div className="report-health-row">
                  <div className="report-health-icon report-health-normal">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <span>Productos en estado normal</span>

                    <strong>
                      {inventoryReport.summary.productsWithNormalStock}
                    </strong>
                  </div>
                </div>

                <div className="report-health-row">
                  <div className="report-health-icon report-health-low">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <span>Productos por reponer pronto</span>

                    <strong>
                      {inventoryReport.summary.productsWithLowStock}
                    </strong>
                  </div>
                </div>

                <div className="report-health-row">
                  <div className="report-health-icon report-health-out">
                    <PackageX size={17} />
                  </div>

                  <div>
                    <span>Productos agotados</span>

                    <strong>
                      {inventoryReport.summary.productsOutOfStock}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="report-table-panel">
            <div className="report-table-heading">
              <div>
                <h4>Detalle del inventario</h4>

                <p>
                  Consulta el stock actual, mínimo y estado de cada producto.
                </p>
              </div>

              <span>
                {inventoryReport.products.length}{" "}
                {inventoryReport.products.length === 1
                  ? "producto"
                  : "productos"}
              </span>
            </div>

            <InventoryReportFilters
              inventorySearch={inventorySearch}
              inventoryStatusFilter={inventoryStatusFilter}
              hasInventoryFilters={hasInventoryFilters}
              onSearchChange={(value) =>
                dispatchInventoryFilters({ type: "SET_FILTER", field: "inventorySearch", value })
              }
              onStatusChange={(value) =>
                dispatchInventoryFilters({ type: "SET_FILTER", field: "inventoryStatusFilter", value })
              }
              onClear={() => dispatchInventoryFilters({ type: "RESET_FILTERS" })}
            />

            {hasInventoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredInventoryProducts.length} de{" "}
                {inventoryReport.products.length} productos.
              </div>
            )}

            <InventoryReportTable
              products={filteredInventoryProducts.map((product) => ({
                ...product,
                stockStatusClass: getStockStatusClass(product.stockStatus),
                stockStatusLabel: getStockStatusLabel(product.stockStatus),
              }))}
            />
          </div>
        </section>
      )}

      {movementReport && (
        <section className="report-section report-movement-section">
          <div className="report-section-heading">
            <div className="report-section-title">
              <div className="report-section-icon">
                <History size={20} />
              </div>

              <div>
                <h3>Reporte de movimientos</h3>

                <p>Analiza las entradas, salidas y balances del inventario.</p>
              </div>
            </div>

            <span className="report-section-chip">
              <Filter size={14} />

              {hasAppliedMovementFilters
                ? "Vista filtrada"
                : "Todo el historial"}
            </span>
          </div>

          <MovementReportFilters
            movementFilters={movementFilters}
            periodOptions={PERIOD_OPTIONS}
            filteringMovements={filteringMovements}
            hasAppliedMovementFilters={hasAppliedMovementFilters}
            activeMovementFilterCount={activeMovementFilterCount}
            activeMovementFilterChips={activeMovementFilterChips}
            productSelectorRef={productSelectorRef}
            productSelectorOpen={productSelectorOpen}
            productSelectorLabel={productSelectorLabel}
            productSelectorSearch={productSelectorSearch}
            filteredMovementProductOptions={filteredMovementProductOptions}
            onPeriodChange={handlePeriodPreset}
            onDateChange={(field, value) =>
              dispatchMovementFilters({
                type: "UPDATE_DRAFT",
                filters: { period: "custom", [field]: value },
              })
            }
            onTypeChange={(value) =>
              dispatchMovementFilters({ type: "UPDATE_DRAFT", filters: { type: value } })
            }
            onToggleProductSelector={() => setProductSelectorOpen((current) => !current)}
            onProductSearchChange={setProductSelectorSearch}
            onSelectAllProducts={selectAllMovementProducts}
            onToggleProduct={toggleMovementProduct}
            onCloseProductSelector={() => {
              setProductSelectorOpen(false);
              setProductSelectorSearch("");
            }}
            onClear={clearMovementFilters}
            onApply={() => applyMovementFilters()}
          />

          {movementReport.movements.length === 0 && (
            <div className="report-no-results">
              <div className="report-no-results-icon">
                <History size={20} />
              </div>

              <div>
                <strong>No se encontraron movimientos</strong>
                <span>
                  No existen movimientos para los filtros seleccionados. Prueba
                  con otro período, tipo o producto.
                </span>
              </div>
            </div>
          )}

          <MovementReportSummary summary={movementReport.summary} />

          <MovementUnitsChart
            data={movementChartData}
            hasAppliedFilters={hasAppliedMovementFilters}
          />

          <div className="report-table-panel">
            <div className="report-table-heading">
              <div>
                <h4>Resumen por producto</h4>

                <p>
                  Consulta entradas, salidas y balance acumulado por producto.
                </p>
              </div>

              <span>
                {movementReport.byProduct.length}{" "}
                {movementReport.byProduct.length === 1
                  ? "producto"
                  : "productos"}
              </span>
            </div>

            <ReportResultSearch
              value={productMovementSearch}
              placeholder="Buscar producto o código..."
              ariaLabel="Buscar resumen de movimientos por producto"
              onChange={(value) =>
                dispatchMovementFilters({ type: "SET_RESULT_SEARCH", field: "productMovementSearch", value })
              }
            />

            <MovementProductReportTable
              products={filteredMovementProducts}
              hasProductMovements={movementReport.byProduct.length > 0}
            />
          </div>

          <div className="report-table-panel report-history-panel">
            <div className="report-table-heading">
              <div>
                <h4>Historial de movimientos</h4>

                <p>Detalle cronológico de entradas y salidas registradas.</p>
              </div>

              <span>
                {movementReport.movements.length}{" "}
                {movementReport.movements.length === 1
                  ? "movimiento"
                  : "movimientos"}
              </span>
            </div>

            <ReportResultSearch
              value={historySearch}
              placeholder="Buscar producto, código u observación..."
              ariaLabel="Buscar historial de movimientos"
              onChange={(value) =>
                dispatchMovementFilters({ type: "SET_RESULT_SEARCH", field: "historySearch", value })
              }
            />

            {hasHistoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredMovementHistory.length} de{" "}
                {movementReport.movements.length} movimientos.
              </div>
            )}

            <MovementHistoryReportTable
              movements={filteredMovementHistory.map((movement) => ({
                ...movement,
                formattedDate: formatMovementDate(movement.date),
              }))}
              hasMovements={movementReport.movements.length > 0}
            />
          </div>
        </section>
      )}
    </>
  );
}

export default ReportsPage;
