// Personal-preference threshold helpers for the Step 3 "Adjust Thresholds"
// panel. Independent of the expert suitability model — the user picks four
// cut-offs and we report the share of days in the current period that meet
// all four simultaneously.

export const DEFAULT_THRESHOLDS = Object.freeze({
  maxTemp: 28,
  minTemp: 0,
  rainfall: 5,
  uvIndex: 7,
});

export const THRESHOLD_RANGES = Object.freeze({
  maxTemp: { min: 20, max: 40, step: 1, label: "Max temp (≤)", unit: "°C" },
  minTemp: { min: 0, max: 20, step: 1, label: "Min temp (≥)", unit: "°C" },
  rainfall: { min: 0, max: 20, step: 0.5, label: "Rainfall (≤)", unit: "mm" },
  uvIndex: { min: 3, max: 14, step: 1, label: "UV index (≤)", unit: "" },
});

function dayPasses(row, t) {
  return (
    row.maxTemp <= t.maxTemp &&
    row.minTemp >= t.minTemp &&
    row.rainfall <= t.rainfall &&
    row.uvIndex <= t.uvIndex
  );
}

export function evaluateDays(rows, thresholds) {
  const usable = (rows || []).filter(
    (r) =>
      r &&
      Number.isFinite(r.maxTemp) &&
      Number.isFinite(r.minTemp) &&
      Number.isFinite(r.rainfall) &&
      Number.isFinite(r.uvIndex),
  );
  const total = usable.length;
  if (!total) {
    return {
      total: 0,
      passed: 0,
      score: null,
      statusLabel: "No daily data",
      colour: "var(--text-muted)",
    };
  }
  const passed = usable.filter((r) => dayPasses(r, thresholds)).length;
  const score = Math.round((passed / total) * 100);

  let colour;
  let statusLabel;
  if (score >= 65) {
    colour = "var(--color-suitable)";
    statusLabel = "Suitable with your thresholds";
  } else if (score >= 40) {
    colour = "var(--color-moderate)";
    statusLabel = "Mixed with your thresholds";
  } else {
    colour = "var(--color-unsuitable)";
    statusLabel = "Unsuitable with your thresholds";
  }
  return { total, passed, score, statusLabel, colour };
}
