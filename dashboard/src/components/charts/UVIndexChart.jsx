import TrendChartWrapper from "./TrendChartWrapper";

export default function UVIndexChart(props) {
  return (
    <TrendChartWrapper
      {...props}
      dataKey="uv"
      label="UV Index"
      unit=""
      color="#f4a261"
      threshold={{ value: 8, label: "UV danger zone" }}
    />
  );
}
