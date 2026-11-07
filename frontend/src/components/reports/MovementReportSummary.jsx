import { ArrowDownToLine, ArrowUpFromLine, History, Scale } from "lucide-react";
import ReportSummaryCard from "./ReportSummaryCard";

function MovementReportSummary({ summary }) {
  return (
    <div className="report-summary-grid report-movement-summary">
      <ReportSummaryCard
        className="report-summary-movements"
        icon={<History size={20} />}
        label="Movimientos"
        value={summary.totalMovements}
        detail="En la vista actual"
      />
      <ReportSummaryCard
        className="report-summary-inbound"
        icon={<ArrowDownToLine size={20} />}
        label="Total entradas"
        value={summary.totalInbound}
        detail={<>{summary.inboundUnits} unidades</>}
      />
      <ReportSummaryCard
        className="report-summary-outbound"
        icon={<ArrowUpFromLine size={20} />}
        label="Total salidas"
        value={summary.totalOutbound}
        detail={<>{summary.outboundUnits} unidades</>}
      />
      <ReportSummaryCard
        className="report-summary-balance"
        icon={<Scale size={20} />}
        label="Balance"
        value={summary.unitBalance}
        detail="Unidades netas"
      />
    </div>
  );
}

export default MovementReportSummary;
