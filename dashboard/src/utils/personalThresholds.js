// Threshold-masked expert score for the Step 3 "Adjust Thresholds" panel.
// For the currently selected period, drop days that fail any of the user's
// four cut-offs and average the per-day expert verdict (`marathonVerdict.score`)
// over the rest. At lenient defaults most days pass and the score stays close
// to the climatology baseline; tightening sliders excludes days and the score
// moves. Both the panel's small live-score card and the big Step 3 score card
// render this same number, so the two views stay in sync.

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

export function evaluateThresholds(rows, thresholds) {
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
      scored: 0,
      score: null,
      statusLabel: "No daily data",
      colour: "var(--text-muted)",
    };
  }

  const passing = usable.filter((r) => dayPasses(r, thresholds));
  const passed = passing.length;

  const scoredRows = passing.filter((r) =>
    Number.isFinite(r?.marathonVerdict?.score),
  );
  const scored = scoredRows.length;

  if (!scored) {
    return {
      total,
      passed,
      scored: 0,
      score: null,
      statusLabel: "No passing days for your thresholds",
      colour: "var(--text-muted)",
    };
  }

  const sum = scoredRows.reduce((acc, r) => acc + r.marathonVerdict.score, 0);
  const score = Math.round(sum / scored);

  let colour;
  let statusLabel;
  if (score > 70) {
    colour = "var(--color-suitable)";
    statusLabel = "Suitable with your thresholds";
  } else if (score > 40) {
    colour = "var(--color-moderate)";
    statusLabel = "Mixed with your thresholds";
  } else {
    colour = "var(--color-unsuitable)";
    statusLabel = "Unsuitable with your thresholds";
  }
  return { total, passed, scored, score, statusLabel, colour };
}
