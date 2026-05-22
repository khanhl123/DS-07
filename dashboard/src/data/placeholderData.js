// Placeholder data layer for the Marathon Weather Planner.
//
// Metrics are the four authorised BoM variables:
//   maxTemp (°C), minTemp (°C), rainfall (mm), uvIndex (0–14)
// Humidity and wind are NOT supported (scope: PROJECT_SCOPE.md §4.2).
//
// This module does not include the station list — see ./stations.js.
// Daily synthesis is done lazily; see ./useStationDaily.js.

import { STATIONS } from "./stations.js";

// Bucket boundaries mirror the expert model in
// models/suitability_score_model.py (RED ≤ 40, ORANGE ≤ 70, GREEN > 70).
// All score consumers — map markers, calendar dots, popups, KPI card —
// share these so colour bands stay consistent everywhere.
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Stations ship with monthlyScores precomputed by the expert model on
// long-term climatology — see pipeline/generate_stations_js.py.
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
  missing: "#D8D5CB",
};

// Shown wherever a numeric score would normally appear but at least one of
// the four model inputs (max temp, min temp, UV, rainfall) is missing.
export const SCORE_NA_TEXT = "Missing data, score not available";

export function getSuitabilityColor(score) {
  if (score == null) return SCORE_COLORS.missing;
  if (score > 70) return SCORE_COLORS.suitable;
  if (score > 40) return SCORE_COLORS.moderate;
  return SCORE_COLORS.unsuitable;
}

export function getSuitabilityLabel(score) {
  if (score == null) return "Missing data";
  if (score > 70) return "Suitable";
  if (score > 40) return "Mixed";
  return "Unsuitable";
}

export function getSuitabilityKey(score) {
  if (score == null) return "missing";
  if (score > 70) return "suitable";
  if (score > 40) return "mixed";
  return "not_suitable";
}

// Mean of the station's non-null monthly scores. Used by the map as a
// climatology fallback so a station with no score for the selected month
// still shows where it sits overall, instead of dropping to grey.
// Returns null when every month is unscorable so callers can render the
// honest "missing" state.
export function getStationAverageScore(station) {
  const scores = station?.monthlyScores?.filter((s) => s != null) ?? [];
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
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
  missing: {
    label: "Missing data",
    color: "bg-[#D8D5CB]",
    textColor: "text-[var(--text-muted)]",
    chipBg: "bg-[#F2F0E6]",
    chipBorder: "border-[#D8D5CB]",
    hex: SCORE_COLORS.missing,
  },
};
