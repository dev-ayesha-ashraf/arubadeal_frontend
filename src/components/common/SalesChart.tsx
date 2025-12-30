import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  title?: string;
  data: any[];
  dataKey?: string;
  xKey?: string;
  color?: string;
}

const SalesChart = ({
  title = "Monthly Sales",
  data,
  dataKey = "sales",
  xKey = "month",
  color = "#2563eb",
}: SalesChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* Centered container with max-width like the requested design */}
      <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;