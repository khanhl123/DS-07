import TrendChartWrapper from "./TrendChartWrapper";

export default function TemperatureChart({ data, xKey }) {
  return <TrendChartWrapper data={data} dataKey="temp" xKey={xKey} label="Temperature" unit={"\u00b0C"} color="#ef4444" />;
}
