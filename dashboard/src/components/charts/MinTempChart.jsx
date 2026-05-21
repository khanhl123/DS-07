import TrendChartWrapper from "./TrendChartWrapper";

export default function MinTempChart({ data, xKey, isPredicted = false }) {
  return (
    <TrendChartWrapper
      data={data}
      dataKey="minTemp"
      xKey={xKey}
      label="Min temperature"
      unit="°C"
      sublabel={`°C — ${isPredicted ? "NN-predicted" : "historical"} daily readings`}
      color="#3B8BD4"
    />
  );
}
