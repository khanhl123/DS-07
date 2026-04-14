import TrendChartWrapper from "./TrendChartWrapper";

export default function MinTempChart({ data, xKey }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="minTemp"
      xKey={xKey}
      label="Min temperature"
      unit="°C"
      sublabel="°C — historical daily readings"
      color="#3B8BD4"
    />
  );
}
