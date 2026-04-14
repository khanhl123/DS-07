import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const COLOR = "#1D9E75";

export default function RainfallChart({ data, xKey, height = 200 }) {
  return (
    <div
      className="subcard"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        padding: 16,
      }}
    >
      <div className="mb-2">
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Rainfall
        </div>
        <div
          className="text-[11px]"
          style={{ color: "var(--text-secondary)" }}
        >
          mm — historical daily totals
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DC" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "#7A8A7C" }}
            axisLine={{ stroke: "#D8D5CB" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#7A8A7C" }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => `${v}mm`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 4,
              border: "1px solid #D8D5CB",
              backgroundColor: "#fff",
              fontSize: 12,
            }}
            formatter={(v) => [`${v}mm`, "Rainfall"]}
          />
          <Bar dataKey="rainfall" fill={COLOR} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
