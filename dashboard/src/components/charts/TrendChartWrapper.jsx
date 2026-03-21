import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ReferenceLine,
} from "recharts";

const SYNC_ID = "marathon-weather-trends";

export default function TrendChartWrapper({
  data,
  dataKey,
  xKey,
  label,
  unit,
  color,
  granularity,
  activeLabel,
  onActiveLabelChange,
  onPointSelect,
  threshold,
  height = 236,
}) {
  const showBrush = granularity === "daily" && data.length > 10;

  const handleMouseMove = (state) => {
    if (state?.activeLabel !== undefined) {
      onActiveLabelChange?.(state.activeLabel);
    }
  };

  const handleClick = (state) => {
    const point = state?.activePayload?.[0]?.payload;
    if (point) {
      onPointSelect?.(point);
    }
  };

  return (
    <div className="marathon-fade-up rounded-2xl border border-[var(--marathon-line)] bg-[#fff9f3] p-4 shadow-[0_16px_28px_rgba(61,46,33,0.05)]">
      <div className="mb-3 flex items-center gap-3">
        <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#6f5b4d]">{label}</h4>
        <span className="h-px flex-1 bg-gradient-to-r from-[rgba(231,111,81,0.5)] via-[rgba(233,196,106,0.45)] to-transparent" aria-hidden="true" />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          syncId={SYNC_ID}
          margin={{ top: 8, right: 12, left: -10, bottom: showBrush ? 14 : 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => onActiveLabelChange?.(null)}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#decdc0" vertical={false} />
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
            width={44}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #e7b296",
              backgroundColor: "#fff8f1",
              fontSize: 12,
              boxShadow: "0 14px 28px rgba(61, 46, 33, 0.12)",
            }}
            cursor={{ stroke: "#cf9f81", strokeWidth: 1, strokeDasharray: "4 4" }}
            formatter={(value) => [`${value}${unit}`, label]}
            labelFormatter={(value) => `${value}`}
          />
          {threshold && (
            <ReferenceLine
              y={threshold.value}
              stroke="#ba4a35"
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
              label={{
                value: threshold.label,
                fill: "#9b422d",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          )}
          {activeLabel !== null && activeLabel !== undefined && (
            <ReferenceLine x={activeLabel} stroke="#a78065" strokeDasharray="4 4" />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.4}
            fill={`url(#grad-${dataKey})`}
            dot={{ r: 3, fill: color, stroke: "#fff9f3", strokeWidth: 1.2 }}
            activeDot={{ r: 5.5, fill: color, stroke: "#fff9f3", strokeWidth: 2 }}
          />
          {showBrush && (
            <Brush
              dataKey={xKey}
              height={18}
              stroke="#cf9f81"
              fill="#f5e7d8"
              travellerWidth={8}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
