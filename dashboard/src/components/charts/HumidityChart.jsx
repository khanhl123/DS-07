import TrendChartWrapper from "./TrendChartWrapper";

export default function HumidityChart(props) {
  return (
    <TrendChartWrapper
      {...props}
      dataKey="humidity"
      label="Humidity"
      unit="%"
      color="#2a9d8f"
      threshold={{ value: 70, label: "Humidity caution" }}
    />
  );
}
