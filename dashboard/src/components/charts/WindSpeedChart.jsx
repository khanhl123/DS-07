import TrendChartWrapper from "./TrendChartWrapper";

export default function WindSpeedChart({ data, xKey }) {
  return <TrendChartWrapper data={data} dataKey="wind" xKey={xKey} label="Wind Speed" unit=" km/h" color="#e9c46a" />;
}
