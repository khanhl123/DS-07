import TrendChartWrapper from "./TrendChartWrapper";

export default function WindSpeedChart(props) {
  return (
    <TrendChartWrapper
      {...props}
      dataKey="wind"
      label="Wind Speed"
      unit=" km/h"
      color="#e9c46a"
      threshold={{ value: 30, label: "Wind advisory" }}
    />
  );
}
