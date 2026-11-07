function ReportSummaryCard({ className, icon, label, value, detail }) {
  return (
    <article className={`report-summary-card ${className}`}>
      <div className="report-summary-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export default ReportSummaryCard;
