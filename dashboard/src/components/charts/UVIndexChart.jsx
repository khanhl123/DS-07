import TrendChartWrapper from "./TrendChartWrapper";

export default function UVIndexChart({ data, xKey }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="uvIndex"
      xKey={xKey}
      label="UV index"
      unit=""
      sublabel="index — historical daily peak"
      color="#EF9F27"
    />
  );
}
