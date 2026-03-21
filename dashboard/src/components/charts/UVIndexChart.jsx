import TrendChartWrapper from "./TrendChartWrapper";

export default function UVIndexChart({ data, xKey }) {
  return <TrendChartWrapper data={data} dataKey="uv" xKey={xKey} label="UV Index" unit="" color="#f4a261" />;
}
