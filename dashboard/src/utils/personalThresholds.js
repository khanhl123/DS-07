// UI metadata for the personal-threshold sliders.
// Score logic now lives in ./suitabilityScore.js — DEFAULT_THRESHOLDS is
// re-exported from there so existing import sites do not break.

export { DEFAULT_THRESHOLDS } from "./suitabilityScore";

export const THRESHOLD_RANGES = Object.freeze({
  maxTemp: { min: -5, max: 45, step: 1, label: "Max temp (≤)", unit: "°C" },
  minTemp: { min: -5, max: 45, step: 1, label: "Min temp (≥)", unit: "°C" },
  rainfall: { min: 0, max: 20, step: 0.5, label: "Rainfall (≤)", unit: "mm" },
  uvIndex: { min: 3, max: 14, step: 1, label: "UV index (≤)", unit: "" },
});
