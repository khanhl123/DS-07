import TrendChartWrapper from "./TrendChartWrapper";
export default function HumidityChart({ data, xKey }) {
  return <TrendChartWrapper data={data} dataKey="humidity" xKey={xKey} label="Humidity" unit="%" color="#3182ce" />;
}
