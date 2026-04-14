import TrendChartWrapper from "./TrendChartWrapper";

export default function MaxTempChart({ data, xKey }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="maxTemp"
      xKey={xKey}
      label="Max temperature"
      unit="°C"
      sublabel="°C — historical daily readings"
      color="#E24B4A"
    />
  );
}
