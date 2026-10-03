import { useEffect, useMemo, useRef, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Filter,
  FileSpreadsheet,
  History,
  Download,
  Layers3,
  Package,
  PackageCheck,
  PackageX,
  RefreshCw,
  Scale,
  Search,
  Warehouse,
  X,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getInventoryReport,
  getMovementReport,
} from "../services/reportService";
import AppSelect from "../components/AppSelect";
import { getProducts } from "../services/productService";

import { exportReportsToExcel } from "../utils/reportExcelExporter";

import "../styles/pages/reports.css";

const EMPTY_MOVEMENT_FILTERS = {
  period: "all",
  from: "",
  to: "",
  type: "",
  productIds: [],
};

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

  const [inventorySearch, setInventorySearch] = useState("");

  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("");

  const [productMovementSearch, setProductMovementSearch] = useState("");

  const [historySearch, setHistorySearch] = useState("");

  const [movementFilters, setMovementFilters] = useState(
    EMPTY_MOVEMENT_FILTERS,
  );
  const [appliedMovementFilters, setAppliedMovementFilters] = useState(
    EMPTY_MOVEMENT_FILTERS,
  );

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
            error.response?.data?.message ||
              "No fue posible cargar los reportes",
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
        error.response?.data?.message ||
          "No fue posible actualizar los reportes",
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
      setAppliedMovementFilters({
        ...filters,
        productIds: [...(filters.productIds || [])],
      });
      setProductMovementSearch("");
      setHistorySearch("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No fue posible aplicar los filtros del reporte",
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
      setMovementFilters(nextFilters);
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

    setMovementFilters(nextFilters);
    applyMovementFilters(nextFilters);
  };

  // Agrega o quita un producto del filtro múltiple sin aplicar todavía la consulta.
  const toggleMovementProduct = (productId) => {
    setMovementFilters((current) => {
      const isSelected = current.productIds.some(
        (selectedId) => String(selectedId) === String(productId),
      );

      return {
        ...current,
        productIds: isSelected
          ? current.productIds.filter(
              (selectedId) => String(selectedId) !== String(productId),
            )
          : [...current.productIds, productId],
      };
    });
  };

  // La lista vacía representa "todos los productos" para el backend.
  const selectAllMovementProducts = () => {
    setMovementFilters((current) => ({
      ...current,
      productIds: [],
    }));
  };

  const clearMovementFilters = () => {
    const clearedFilters = {
      ...EMPTY_MOVEMENT_FILTERS,
      productIds: [],
    };

    setMovementFilters(clearedFilters);
    setProductSelectorOpen(false);
    setProductSelectorSearch("");
    applyMovementFilters(clearedFilters);
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
        filters: EMPTY_MOVEMENT_FILTERS,
        mode: "full",
      });

      setExportMessage("El reporte completo se exportó correctamente a Excel.");
    } catch (exportError) {
      setError(
        exportError.response?.data?.message ||
          exportError.message ||
          "No fue posible generar el archivo Excel",
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

          <div className="report-summary-grid report-inventory-summary">
            <article className="report-summary-card report-summary-products">
              <div className="report-summary-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Total productos</span>

                <strong>{inventoryReport.summary.totalProducts}</strong>

                <small>Registrados</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-units">
              <div className="report-summary-icon">
                <Boxes size={20} />
              </div>

              <div>
                <span>Unidades en stock</span>

                <strong>{inventoryReport.summary.totalUnitsInStock}</strong>

                <small>Disponibles</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-low">
              <div className="report-summary-icon">
                <AlertTriangle size={20} />
              </div>

              <div>
                <span>Stock bajo</span>

                <strong>{inventoryReport.summary.productsWithLowStock}</strong>

                <small>Requieren atención</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-out">
              <div className="report-summary-icon">
                <PackageX size={20} />
              </div>

              <div>
                <span>Sin stock</span>

                <strong>{inventoryReport.summary.productsOutOfStock}</strong>

                <small>Sin unidades</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-normal">
              <div className="report-summary-icon">
                <PackageCheck size={20} />
              </div>

              <div>
                <span>Stock normal</span>

                <strong>
                  {inventoryReport.summary.productsWithNormalStock}
                </strong>

                <small>Sin alertas</small>
              </div>
            </article>
          </div>

          <div className="report-visual-grid">
            <article className="report-chart-card">
              <div className="report-card-heading">
                <div>
                  <h4>Distribución del inventario</h4>

                  <p>Productos agrupados por estado de stock.</p>
                </div>

                <Layers3 size={19} />
              </div>

              <div className="report-donut-layout">
                <div className="report-donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryStatusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={86}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {inventoryStatusData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="report-donut-center">
                    <strong>{inventoryReport.summary.totalProducts}</strong>

                    <span>productos</span>
                  </div>
                </div>

                <div className="report-donut-legend">
                  {inventoryStatusData.map((item) => (
                    <div className="report-donut-row" key={item.name}>
                      <div>
                        <span
                          className="report-legend-dot"
                          style={{ background: item.color }}
                        />

                        <span>{item.name}</span>
                      </div>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

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

            <div className="report-toolbar">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={inventorySearch}
                  placeholder="Buscar código, producto o categoría..."
                  aria-label="Buscar en reporte de inventario"
                  onChange={(event) => setInventorySearch(event.target.value)}
                />
              </div>

              <div className="report-filter">
                <Filter size={15} />

                <AppSelect
                  value={inventoryStatusFilter}
                  aria-label="Filtrar inventario por estado"
                  onChange={(event) =>
                    setInventoryStatusFilter(event.target.value)
                  }
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
                  onClick={() => {
                    setInventorySearch("");

                    setInventoryStatusFilter("");
                  }}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {hasInventoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredInventoryProducts.length} de{" "}
                {inventoryReport.products.length} productos.
              </div>
            )}

            <div className="report-table-container">
              {filteredInventoryProducts.length === 0 ? (
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
                    {filteredInventoryProducts.map((product) => (
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
                            className={getStockStatusClass(product.stockStatus)}
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

                            {getStockStatusLabel(product.stockStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={
                      movementFilters.period === option.value
                        ? "report-period-button report-period-button-active"
                        : "report-period-button"
                    }
                    onClick={() => handlePeriodPreset(option.value)}
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
                    onChange={(event) =>
                      setMovementFilters((current) => ({
                        ...current,
                        period: "custom",
                        from: event.target.value,
                      }))
                    }
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
                    onChange={(event) =>
                      setMovementFilters((current) => ({
                        ...current,
                        period: "custom",
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
              </label>

              <label className="report-filter-field">
                <span>Tipo de movimiento</span>
                <div className="report-select-input">
                  <ArrowDownToLine size={15} />
                  <AppSelect
                    value={movementFilters.type}
                    onChange={(event) =>
                      setMovementFilters((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
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
                    onClick={() =>
                      setProductSelectorOpen((current) => !current)
                    }
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
                          onChange={(event) =>
                            setProductSelectorSearch(event.target.value)
                          }
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
                        onClick={selectAllMovementProducts}
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
                                  toggleMovementProduct(product.productId)
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
                          onClick={() => {
                            setProductSelectorOpen(false);
                            setProductSelectorSearch("");
                          }}
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
                  onClick={clearMovementFilters}
                  disabled={filteringMovements}
                >
                  <X size={15} />
                  Limpiar filtros
                </button>

                <button
                  type="button"
                  className="report-filter-apply-button"
                  onClick={() => applyMovementFilters()}
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

          <div className="report-summary-grid report-movement-summary">
            <article className="report-summary-card report-summary-movements">
              <div className="report-summary-icon">
                <History size={20} />
              </div>

              <div>
                <span>Movimientos</span>

                <strong>{movementReport.summary.totalMovements}</strong>

                <small>En la vista actual</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-inbound">
              <div className="report-summary-icon">
                <ArrowDownToLine size={20} />
              </div>

              <div>
                <span>Total entradas</span>

                <strong>{movementReport.summary.totalInbound}</strong>

                <small>{movementReport.summary.inboundUnits} unidades</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-outbound">
              <div className="report-summary-icon">
                <ArrowUpFromLine size={20} />
              </div>

              <div>
                <span>Total salidas</span>

                <strong>{movementReport.summary.totalOutbound}</strong>

                <small>{movementReport.summary.outboundUnits} unidades</small>
              </div>
            </article>

            <article className="report-summary-card report-summary-balance">
              <div className="report-summary-icon">
                <Scale size={20} />
              </div>

              <div>
                <span>Balance</span>

                <strong>{movementReport.summary.unitBalance}</strong>

                <small>Unidades netas</small>
              </div>
            </article>
          </div>

          <article className="report-chart-card report-movement-chart-card">
            <div className="report-card-heading">
              <div>
                <h4>Unidades por producto</h4>

                <p>
                  Comparación de unidades ingresadas y retiradas en los
                  productos con mayor actividad.
                </p>
              </div>

              <BarChart3 size={19} />
            </div>

            {movementChartData.length === 0 ? (
              <div className="report-empty-state report-chart-empty">
                <BarChart3 size={25} />

                <h4>Sin datos para graficar</h4>

                <p>
                  {hasAppliedMovementFilters
                    ? "No hay movimientos para los filtros seleccionados."
                    : "No hay movimientos registrados por producto."}
                </p>
              </div>
            ) : (
              <div className="report-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={movementChartData}
                    margin={{
                      top: 10,

                      right: 10,

                      left: -15,

                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#dce8e2"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="entradas"
                      name="Entradas"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="salidas"
                      name="Salidas"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

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

            <div className="report-toolbar report-toolbar-simple">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={productMovementSearch}
                  placeholder="Buscar producto o código..."
                  aria-label="Buscar resumen de movimientos por producto"
                  onChange={(event) =>
                    setProductMovementSearch(event.target.value)
                  }
                />
              </div>

              {productMovementSearch && (
                <button
                  type="button"
                  className="report-clear-button"
                  onClick={() => setProductMovementSearch("")}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            <div className="report-table-container">
              {filteredMovementProducts.length === 0 ? (
                <div className="report-empty-state">
                  <Package size={25} />

                  <h4>No encontramos productos</h4>

                  <p>
                    {movementReport.byProduct.length === 0
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
                    {filteredMovementProducts.map((product) => (
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

            <div className="report-toolbar report-toolbar-simple">
              <div className="report-search">
                <Search size={16} />

                <input
                  type="search"
                  value={historySearch}
                  placeholder="Buscar producto, código u observación..."
                  aria-label="Buscar historial de movimientos"
                  onChange={(event) => setHistorySearch(event.target.value)}
                />
              </div>

              {hasHistoryFilters && (
                <button
                  type="button"
                  className="report-clear-button"
                  onClick={() => setHistorySearch("")}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {hasHistoryFilters && (
              <div className="report-filter-summary">
                Mostrando {filteredMovementHistory.length} de{" "}
                {movementReport.movements.length} movimientos.
              </div>
            )}

            <div className="report-table-container">
              {filteredMovementHistory.length === 0 ? (
                <div className="report-empty-state">
                  <History size={25} />

                  <h4>No encontramos movimientos</h4>

                  <p>
                    {movementReport.movements.length === 0
                      ? "No existen movimientos para los filtros seleccionados."
                      : "Prueba cambiando el término de búsqueda."}
                  </p>
                </div>
              ) : (
                <table className="report-table report-history-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>

                      <th>Producto</th>

                      <th>Tipo</th>

                      <th>Cantidad</th>

                      <th>Stock resultante</th>

                      <th>Observación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMovementHistory.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          <div className="report-date-cell">
                            <CalendarDays size={14} />

                            <span>{formatMovementDate(movement.date)}</span>
                          </div>
                        </td>

                        <td>
                          <div className="report-product-cell">
                            <div className="report-product-icon">
                              <Package size={15} />
                            </div>

                            <div>
                              <strong>{movement.productName}</strong>

                              <span>{movement.productCode}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              movement.type === "ENTRADA"
                                ? "report-movement-badge report-movement-entry"
                                : "report-movement-badge report-movement-exit"
                            }
                          >
                            {movement.type === "ENTRADA" ? (
                              <ArrowDownToLine size={12} />
                            ) : (
                              <ArrowUpFromLine size={12} />
                            )}

                            {movement.type === "ENTRADA" ? "Entrada" : "Salida"}
                          </span>
                        </td>

                        <td>
                          <strong
                            className={
                              movement.type === "ENTRADA"
                                ? "report-number-entry"
                                : "report-number-exit"
                            }
                          >
                            {movement.type === "ENTRADA" ? "+" : "-"}

                            {movement.quantity}
                          </strong>
                        </td>

                        <td>
                          <span className="report-stock-result">
                            {movement.resultingStock}
                          </span>
                        </td>

                        <td>
                          <span className="report-observation">
                            {movement.observation || "Sin observación"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default ReportsPage;
