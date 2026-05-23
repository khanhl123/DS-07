// Threshold-relative suitability scoring.
//
// Each of the four metrics contributes one 25-point sub-score:
//   * actual within threshold        → 25 / 25
//   * actual outside threshold       → 25 * max(0, 1 − distance / buffer)
//
// `distance` is signed by direction: maxTemp / rainfall / uvIndex penalise
// when the actual EXCEEDS the threshold; minTemp penalises when the actual
// is BELOW the threshold. Buffers cap how quickly a sub-score collapses
// past its threshold — a metric just slightly over still earns most of its
// 25 points, while a metric far past its buffer earns zero.
//
// The buffer constants are tuning, not user-adjustable; only the four
// threshold values flow in from the slider panel.
//
// Daily score = sum of the four sub-scores (0 – 100, finer-grained than
// the bare pass/fail count). Monthly score = mean of daily scores over
// the period, rounded. Probability is a separate statistic — the share of
// days in the period that meet EVERY threshold simultaneously — exposed
// alongside the score so callers can show both signals.

export const DEFAULT_THRESHOLDS = Object.freeze({
  maxTemp: 28,
  minTemp: 0,
  rainfall: 5,
  uvIndex: 7,
});

export const BUFFERS = Object.freeze({
  maxTemp: 10, // °C past the cap before the sub-score collapses to zero
  minTemp: 8, // °C below the floor before the sub-score collapses to zero
  rainfall: 15, // mm past the cap
  uvIndex: 6, // UV index units past the cap
});

const SUB_SCORE = 25;

function metricScore(actual, threshold, buffer, direction) {
  const distance =
    direction === "above" ? actual - threshold : threshold - actual;
  if (distance <= 0) return SUB_SCORE;
  return SUB_SCORE * Math.max(0, 1 - distance / buffer);
}

function isFiniteDay(d) {
  return (
    d &&
    Number.isFinite(d.maxTemp) &&
    Number.isFinite(d.minTemp) &&
    Number.isFinite(d.rainfall) &&
    Number.isFinite(d.uvIndex)
  );
}

export function computeDailyScore(dayData, thresholds = DEFAULT_THRESHOLDS) {
  if (!isFiniteDay(dayData)) return null;
  return (
    metricScore(dayData.maxTemp, thresholds.maxTemp, BUFFERS.maxTemp, "above") +
    metricScore(dayData.minTemp, thresholds.minTemp, BUFFERS.minTemp, "below") +
    metricScore(
      dayData.rainfall,
      thresholds.rainfall,
      BUFFERS.rainfall,
      "above",
    ) +
    metricScore(dayData.uvIndex, thresholds.uvIndex, BUFFERS.uvIndex, "above")
  );
}

export function computeMonthlyScore(
  dailyData,
  thresholds = DEFAULT_THRESHOLDS,
) {
  const scores = (dailyData ?? [])
    .map((d) => computeDailyScore(d, thresholds))
    .filter((s) => s != null);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function dayMeetsAll(day, thresholds) {
  return (
    day.maxTemp <= thresholds.maxTemp &&
    day.minTemp >= thresholds.minTemp &&
    day.rainfall <= thresholds.rainfall &&
    day.uvIndex <= thresholds.uvIndex
  );
}

export function computeProbability(
  dailyData,
  thresholds = DEFAULT_THRESHOLDS,
) {
  const usable = (dailyData ?? []).filter(isFiniteDay);
  if (usable.length === 0) return null;
  const passed = usable.filter((d) => dayMeetsAll(d, thresholds)).length;
  return Math.round((passed / usable.length) * 100);
}
