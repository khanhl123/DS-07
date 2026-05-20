// Placeholder data layer for the Marathon Weather Planner.
//
// Metrics are the four authorised BoM variables:
//   maxTemp (°C), minTemp (°C), rainfall (mm), uvIndex (0–14)
// Humidity and wind are NOT supported (scope: PROJECT_SCOPE.md §4.2).
//
// This module does not include the station list — see ./stations.js.
// Daily synthesis is done lazily; see ./useStationDaily.js.

import { STATIONS } from "./stations.js";

export const DEFAULT_THRESHOLDS = {
  maxTemp: 26, // °C — day is unsuitable above this
  minTemp: 8,  // °C — day is unsuitable below this
  rainfall: 4, // mm
  uv: 6,       // UV index
};

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Stations now ship with real monthlyScores precomputed from historical
// climatology by pipeline/generate_stations_js.py — no client-side heuristic.
export const stations = STATIONS;

export const stationsByNumber = Object.fromEntries(stations.map((s) => [s.n, s]));

// Map BoM state codes to the full names used in au-states.json (STATE_NAME).
export const STATE_FULL_NAMES = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

// Per-state station counts derived from the generated STATIONS list, so UI
// copy (CoverageHints, Footer, Hero) and the map's supported-state shading
// stay accurate when pipeline/generate_stations_js.py regenerates the file.
export const stationCountsByState = stations.reduce((acc, s) => {
  acc[s.state] = (acc[s.state] ?? 0) + 1;
  return acc;
}, {});

export const coveredStateCodes = Object.keys(stationCountsByState).sort();

// Default selection: a well-known Melbourne station (Olympic Park area).
export const DEFAULT_STATION_NUMBER =
  stations.find((s) => s.state === "VIC" && /melbourne|olympic/i.test(s.name))?.n ||
  stations.find((s) => s.state === "VIC")?.n ||
  stations[0]?.n;

// Fixed data colours (must not drift from the Eucalyptus spec).
export const METRIC_COLORS = {
  maxTemp: "#E24B4A",
  minTemp: "#3B8BD4",
  rainfall: "#1D9E75",
  uvIndex: "#EF9F27",
};

export const SCORE_COLORS = {
  suitable: "#59C459",
  moderate: "#EFA827",
  unsuitable: "#E24B4A",
};

// Threshold-aware score adjustment applied on top of a station's monthly base score.
export function computeAdjustedScore(baseScore, thresholds) {
  const d = DEFAULT_THRESHOLDS;
  let modifier = 0;
  modifier += (thresholds.maxTemp - d.maxTemp) * 1.5;
  modifier -= (thresholds.minTemp - d.minTemp) * 1.0;
  modifier += (thresholds.rainfall - d.rainfall) * 1.2;
  modifier += (thresholds.uv - d.uv) * 1.5;
  return Math.max(0, Math.min(100, Math.round(baseScore + modifier)));
}

// Score a single synthesised day against the current thresholds (0..100).
export function scoreDayAgainstThresholds(day, thresholds) {
  let score = 100;
  if (day.maxTemp > thresholds.maxTemp) {
    score -= (day.maxTemp - thresholds.maxTemp) * 5;
  }
  if (day.maxTemp < 10) {
    score -= (10 - day.maxTemp) * 3;
  }
  if (day.minTemp < thresholds.minTemp) {
    score -= (thresholds.minTemp - day.minTemp) * 3;
  }
  if (day.rainfall > thresholds.rainfall) {
    score -= (day.rainfall - thresholds.rainfall) * 8;
  }
  if (day.uvIndex > thresholds.uv) {
    score -= (day.uvIndex - thresholds.uv) * 6;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getSuitabilityColor(score) {
  if (score >= 65) return SCORE_COLORS.suitable;
  if (score >= 40) return SCORE_COLORS.moderate;
  return SCORE_COLORS.unsuitable;
}

export function getSuitabilityLabel(score) {
  if (score >= 65) return "Suitable";
  if (score >= 40) return "Mixed";
  return "Unsuitable";
}

export function getSuitabilityKey(score) {
  if (score >= 65) return "suitable";
  if (score >= 40) return "mixed";
  return "not_suitable";
}

export const suitabilityConfig = {
  suitable: {
    label: "Suitable",
    color: "bg-[#59C459]",
    textColor: "text-[#1f6b2a]",
    chipBg: "bg-[#E1F7E3]",
    chipBorder: "border-[#A6E6AD]",
    hex: SCORE_COLORS.suitable,
  },
  mixed: {
    label: "Mixed",
    color: "bg-[#EFA827]",
    textColor: "text-[#7a5a0a]",
    chipBg: "bg-[#FBEFCC]",
    chipBorder: "border-[#E9CD84]",
    hex: SCORE_COLORS.moderate,
  },
  not_suitable: {
    label: "Unsuitable",
    color: "bg-[#E24B4A]",
    textColor: "text-[#8a2a29]",
    chipBg: "bg-[#FADBDB]",
    chipBorder: "border-[#E9A7A6]",
    hex: SCORE_COLORS.unsuitable,
  },
};

// Rank every station for a given month using the current thresholds.
export function rankStationsForMonth(monthIndex, thresholds, limit = 5) {
  const rows = stations.map((s) => ({
    station: s,
    score: computeAdjustedScore(s.monthlyScores[monthIndex], thresholds),
  }));
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}
