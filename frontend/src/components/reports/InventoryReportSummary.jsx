import { AlertTriangle, Boxes, Package, PackageCheck, PackageX } from "lucide-react";
import ReportSummaryCard from "./ReportSummaryCard";

function InventoryReportSummary({ summary }) {
  return (
    <div className="report-summary-grid report-inventory-summary">
      <ReportSummaryCard
        className="report-summary-products"
        icon={<Package size={20} />}
        label="Total productos"
        value={summary.totalProducts}
        detail="Registrados"
      />
      <ReportSummaryCard
        className="report-summary-units"
        icon={<Boxes size={20} />}
        label="Unidades en stock"
        value={summary.totalUnitsInStock}
        detail="Disponibles"
      />
      <ReportSummaryCard
        className="report-summary-low"
        icon={<AlertTriangle size={20} />}
        label="Stock bajo"
        value={summary.productsWithLowStock}
        detail="Requieren atención"
      />
      <ReportSummaryCard
        className="report-summary-out"
        icon={<PackageX size={20} />}
        label="Sin stock"
        value={summary.productsOutOfStock}
        detail="Sin unidades"
      />
      <ReportSummaryCard
        className="report-summary-normal"
        icon={<PackageCheck size={20} />}
        label="Stock normal"
        value={summary.productsWithNormalStock}
        detail="Sin alertas"
      />
    </div>
  );
}

export default InventoryReportSummary;
