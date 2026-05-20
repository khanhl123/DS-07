import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function TrendChartWrapper({
  data,
  dataKey,
  xKey,
  label,
  sublabel,
  unit,
  color,
  height = 200,
}) {
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
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </div>
        {sublabel && (
          <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {sublabel}
          </div>
        )}
      </div>
      <div
        role="img"
        aria-label={
          `${label} trend chart, ${data?.length ?? 0} ` +
          `${data?.length === 1 ? "observation" : "observations"}` +
          (unit ? ` in ${unit}` : "")
        }
      >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DC" />
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
            domain={["auto", "auto"]}
            allowDecimals={false}
            tickFormatter={(v) => `${v}${unit}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 4,
              border: "1px solid #D8D5CB",
              backgroundColor: "#fff",
              fontSize: 12,
            }}
            formatter={(v) => [`${v}${unit}`, label]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
