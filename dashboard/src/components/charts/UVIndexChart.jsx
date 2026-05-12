import TrendChartWrapper from "./TrendChartWrapper";

export default function UVIndexChart({ data, xKey }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="uvIndex"
      xKey={xKey}
      label="UV index*"
      unit=""
      sublabel="estimated from BoM solar exposure (MJ/m²)"
      color="#EF9F27"
    />
  );
}
