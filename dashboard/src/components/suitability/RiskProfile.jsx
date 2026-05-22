import { useMemo } from "react";
import { summariseMonthly } from "../../data/useStationDaily";

// Per-component scoring ports from models/suitability_score_model.py. Each
// returns 0..100 reflecting how favourable that single weather variable is
// for marathon-running, using the same research-backed knee points as the
// composite score. Returns null (not 0) when the input is missing so the
// UI can distinguish "missing data" from "low score".
function scoreMaxTemp(t) {
  if (t == null) return null;
  if (t < 0) return 15;
  if (t < 5) return 40;
  if (t < 8) return 70;
  if (t < 12) return 100;
  if (t < 15) return 90;
  if (t < 18) return 78;
  if (t < 22) return 60;
  if (t < 25) return 38;
  if (t < 28) return 20;
  if (t < 32) return 8;
  return 0;
}

function scoreMinTemp(t) {
  if (t == null) return null;
  if (t < -5) return 10;
  if (t < 0) return 30;
  if (t < 5) return 65;
  if (t < 10) return 95;
  if (t < 15) return 100;
  if (t < 18) return 80;
  if (t < 22) return 55;
  return 25;
}

function scoreRainfall(r) {
  if (r == null) return null;
  if (r === 0) return 100;
  if (r <= 1) return 92;
  if (r <= 2.5) return 80;
  if (r <= 5) return 65;
  if (r <= 10) return 42;
  if (r <= 20) return 20;
  if (r <= 30) return 8;
  return 2;
}

function scoreUv(u) {
  if (u == null) return null;
  if (u <= 2) return 100;
  if (u <= 5) return 78;
  if (u <= 7) return 52;
  if (u <= 10) return 22;
  return 0;
}

function fillColor(score) {
  if (score == null) return "#D8D5CB";
  if (score > 70) return "#59C459";
  if (score > 40) return "#EFA827";
  return "#E24B4A";
}

const MISSING_BAR_BG =
  "linear-gradient(45deg, #E6E3D7 25%, #F2F0E6 25%, #F2F0E6 50%, #E6E3D7 50%, #E6E3D7 75%, #F2F0E6 75%) 0/8px 8px";

const INTERPRETATIONS = {
  maxTemp: "Max temperature is the primary risk factor. Consider an early morning start or selecting a cooler month.",
  minTemp: "Min temperature is the primary risk factor. Early mornings may be too cold for runners warming up — consider a later start.",
  rainfall: "Rainfall is the primary risk factor. Historical wet days suggest building contingency plans for track conditions.",
  uv: "UV is the primary risk factor. Consider early morning start times before 7am to reduce exposure.",
};

export default function RiskProfile({ dailyData }) {
  const rows = useMemo(() => {
    const s = summariseMonthly(dailyData);
    const v = (val, unit) => (val == null ? `— ${unit} avg` : `${val}${unit} avg`);
    return [
      { key: "maxTemp", name: "Max temperature", score: scoreMaxTemp(s.maxTemp), value: v(s.maxTemp, "°C") },
      { key: "minTemp", name: "Min temperature", score: scoreMinTemp(s.minTemp), value: v(s.minTemp, "°C") },
      { key: "rainfall", name: "Rainfall", score: scoreRainfall(s.rainfall), value: v(s.rainfall, "mm") },
      { key: "uv", name: "UV index", score: scoreUv(s.uvIndex), value: s.uvIndex == null ? "— avg" : `${s.uvIndex} avg` },
    ];
  }, [dailyData]);

  // Filter nulls before reducing — `null <= number` coerces to 0 and would
  // falsely pick a missing-data row as the weakest factor.
  const scorable = rows.filter((r) => r.score != null);
  const weakest = scorable.length
    ? scorable.reduce((a, b) => (a.score <= b.score ? a : b))
    : null;

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
                  width: row.score == null ? "100%" : `${row.score}%`,
                  background: row.score == null ? MISSING_BAR_BG : fillColor(row.score),
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
              {row.score ?? "—"}
            </span>
          </div>
        ))}
      </div>
      <p
        className="mt-3 text-[11px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {weakest
          ? INTERPRETATIONS[weakest.key]
          : "Insufficient data to identify a limiting factor for this period."}
      </p>
    </div>
  );
}
