import { useMemo } from "react";
import { summariseMonthly } from "../../data/useStationDaily";

function metricScore(metric, value, thresholds) {
  switch (metric) {
    case "maxTemp": {
      if (value <= thresholds.maxTemp) return 90;
      const over = value - thresholds.maxTemp;
      return Math.max(10, Math.round(90 - over * 10));
    }
    case "minTemp": {
      if (value >= thresholds.minTemp) return 90;
      const under = thresholds.minTemp - value;
      return Math.max(10, Math.round(90 - under * 8));
    }
    case "rainfall": {
      if (value <= thresholds.rainfall) return 90;
      const over = value - thresholds.rainfall;
      return Math.max(10, Math.round(90 - over * 12));
    }
    case "uv": {
      if (value <= thresholds.uv) return 90;
      const over = value - thresholds.uv;
      return Math.max(10, Math.round(90 - over * 10));
    }
    default:
      return 50;
  }
}

function fillColor(score) {
  if (score >= 65) return "#59C459";
  if (score >= 40) return "#EFA827";
  return "#E24B4A";
}

const INTERPRETATIONS = {
  maxTemp: "Max temperature is the primary risk factor. Consider an early morning start or selecting a cooler month.",
  minTemp: "Min temperature is the primary risk factor. Early mornings may be too cold for runners warming up — consider a later start.",
  rainfall: "Rainfall is the primary risk factor. Historical wet days suggest building contingency plans for track conditions.",
  uv: "UV is the primary risk factor. Consider early morning start times before 7am to reduce exposure.",
};

export default function RiskProfile({ dailyData, thresholds }) {
  const rows = useMemo(() => {
    const s = summariseMonthly(dailyData);
    return [
      { key: "maxTemp", name: "Max temperature", score: metricScore("maxTemp", s.maxTemp, thresholds), value: `${s.maxTemp}°C avg` },
      { key: "minTemp", name: "Min temperature", score: metricScore("minTemp", s.minTemp, thresholds), value: `${s.minTemp}°C avg` },
      { key: "rainfall", name: "Rainfall", score: metricScore("rainfall", s.rainfall, thresholds), value: `${s.rainfall}mm avg` },
      { key: "uv", name: "UV index", score: metricScore("uv", s.uvIndex, thresholds), value: `${s.uvIndex} avg` },
    ];
  }, [dailyData, thresholds]);

  const weakest = rows.reduce((a, b) => (a.score <= b.score ? a : b), rows[0]);

  return (
    <div
      className="p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <h4
        className="mb-3 text-sm font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Risk profile — what limits suitability?
      </h4>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: "120px 1fr 60px 36px" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              {row.name}
            </span>
            <div
              className="relative h-2 overflow-hidden"
              style={{ background: "var(--border-light)", borderRadius: "var(--radius-sm)" }}
            >
              <div
                style={{
                  width: `${row.score}%`,
                  background: fillColor(row.score),
                  height: "100%",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            </div>
            <span
              className="text-[11px] text-right tabular-nums"
              style={{ color: "var(--text-secondary)" }}
            >
              {row.value}
            </span>
            <span
              className="text-xs font-bold text-right tabular-nums"
              style={{ color: fillColor(row.score) }}
            >
              {row.score}
            </span>
          </div>
        ))}
      </div>
      <p
        className="mt-3 text-[11px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {INTERPRETATIONS[weakest.key]}
      </p>
    </div>
  );
}
