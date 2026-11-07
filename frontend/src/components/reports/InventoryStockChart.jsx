import { Layers3 } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function InventoryStockChart({ data, totalProducts }) {
  return (
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
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="report-donut-center">
            <strong>{totalProducts}</strong>

            <span>productos</span>
          </div>
        </div>

        <div className="report-donut-legend">
          {data.map((item) => (
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
  );
}

export default InventoryStockChart;
