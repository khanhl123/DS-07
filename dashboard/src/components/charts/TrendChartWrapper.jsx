import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function TrendChartWrapper({ data, dataKey, xKey, label, unit, color, height = 200 }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold text-[var(--text-secondary)]">{label}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#718096" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#718096" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}${unit}`} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(v) => [`${v}${unit}`, label]}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
