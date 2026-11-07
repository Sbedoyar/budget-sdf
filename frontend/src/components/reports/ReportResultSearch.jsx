import { Search, X } from "lucide-react";

function ReportResultSearch({
  value,
  placeholder,
  ariaLabel,
  onChange,
}) {
  return (
    <div className="report-toolbar report-toolbar-simple">
      <div className="report-search">
        <Search size={16} />

        <input
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {value && (
        <button
          type="button"
          className="report-clear-button"
          onClick={() => onChange("")}
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}

export default ReportResultSearch;
