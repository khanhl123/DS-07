import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function TrendChartWrapper({ data, dataKey, xKey, label, unit, color, height = 200 }) {
  return (
    <div className="rounded-2xl border border-[var(--marathon-line)] bg-[#fff9f3] p-4 shadow-[0_16px_28px_rgba(61,46,33,0.05)]">
      <div className="mb-3 flex items-center gap-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6454]">{label}</h4>
        <span className="h-px flex-1 bg-gradient-to-r from-[rgba(231,111,81,0.4)] to-transparent" aria-hidden="true" />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6d8cb" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "#8d7768" }}
            axisLine={{ stroke: "#dccabb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8d7768" }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${v}${unit}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #e7b296",
              backgroundColor: "#fff8f1",
              fontSize: 12,
              boxShadow: "0 14px 28px rgba(61, 46, 33, 0.12)",
            }}
            cursor={{ stroke: "#d6b9a5", strokeWidth: 1 }}
            formatter={(v) => [`${v}${unit}`, label]}
            labelFormatter={(l) => `${l}`}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
