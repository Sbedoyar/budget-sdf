import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function MovementUnitsChart({ data, hasAppliedFilters }) {
  return (
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

      {data.length === 0 ? (
        <div className="report-empty-state report-chart-empty">
          <BarChart3 size={25} />

          <h4>Sin datos para graficar</h4>

          <p>
            {hasAppliedFilters
              ? "No hay movimientos para los filtros seleccionados."
              : "No hay movimientos registrados por producto."}
          </p>
        </div>
      ) : (
        <div className="report-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
  );
}

export default MovementUnitsChart;
