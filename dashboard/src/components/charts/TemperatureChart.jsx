import TrendChartWrapper from "./TrendChartWrapper";

export default function TemperatureChart(props) {
  return (
    <TrendChartWrapper
      {...props}
      dataKey="temp"
      label="Temperature"
      unit={"\u00b0C"}
      color="#e76f51"
      threshold={{ value: 25, label: "Heat risk threshold" }}
    />
  );
}
