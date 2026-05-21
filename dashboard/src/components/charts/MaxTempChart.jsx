import TrendChartWrapper from "./TrendChartWrapper";

export default function MaxTempChart({ data, xKey, isPredicted = false }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="maxTemp"
      xKey={xKey}
      label="Max temperature"
      unit="°C"
      sublabel={`°C — ${isPredicted ? "NN-predicted" : "historical"} daily readings`}
      color="#E24B4A"
    />
  );
}
