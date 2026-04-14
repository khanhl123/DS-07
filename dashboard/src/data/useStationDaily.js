// Lazy synthesiser for a station's daily metrics for a given month.
// Produces a deterministic 28–31 day array shaped like:
//   [{ day, date, maxTemp, minTemp, rainfall, uvIndex }]
//
// Real BoM cleaned daily data is not committed to the repo; this placeholder
// lets the charts, probability banner, and calendar exercise the UI end-to-end.
// Signatures are stable so a future swap to real data is mechanical.

import { useMemo } from "react";

const DEFAULT_YEAR = 2024;

function seeded(a, b, c) {
  let h = 2166136261 ^ (a * 2654435761);
  h ^= (b * 40503) | 0;
  h ^= (c * 16777619) | 0;
  h = (h ^ (h >>> 13)) >>> 0;
  return (h % 100000) / 100000;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Rough baseline curves by latitude band — mirror the monthly-score logic
// loosely so charts feel consistent with the map dot colouring.
function baselineFor(absLat, monthIndex) {
  if (absLat < 20) {
    const maxT = [33, 33, 33, 32, 31, 30, 30, 31, 33, 34, 34, 33][monthIndex];
    const minT = [25, 25, 24, 23, 20, 19, 18, 19, 22, 25, 25, 25][monthIndex];
    const rain = [8, 9, 6, 3, 1, 0.5, 0.3, 0.5, 1, 3, 5, 7][monthIndex];
    const uv = [12, 12, 11, 9, 7, 6, 6, 8, 10, 12, 13, 13][monthIndex];
    return { maxT, minT, rain, uv };
  }
  if (absLat < 35) {
    const maxT = [29, 29, 27, 24, 20, 17, 16, 18, 21, 24, 26, 28][monthIndex];
    const minT = [17, 17, 15, 12, 8, 6, 5, 6, 8, 11, 13, 15][monthIndex];
    const rain = [3, 3, 3, 3, 4, 5, 5, 4, 3, 3, 3, 3][monthIndex];
    const uv = [11, 10, 8, 6, 4, 3, 3, 4, 6, 8, 10, 11][monthIndex];
    return { maxT, minT, rain, uv };
  }
  const maxT = [24, 24, 22, 18, 14, 11, 10, 12, 15, 18, 21, 23][monthIndex];
  const minT = [12, 12, 10, 7, 5, 3, 2, 3, 5, 7, 9, 11][monthIndex];
  const rain = [3, 3, 3, 4, 5, 6, 6, 5, 4, 4, 3, 3][monthIndex];
  const uv = [10, 9, 7, 5, 3, 2, 2, 3, 5, 7, 9, 10][monthIndex];
  return { maxT, minT, rain, uv };
}

export function synthesiseStationDaily(
  station,
  monthIndex,
  year = DEFAULT_YEAR,
) {
  if (!station) return [];
  const total = daysInMonth(year, monthIndex);
  const absLat = Math.abs(station.lat);
  const b = baselineFor(absLat, monthIndex);
  const out = [];
  const stationSeed = Number.parseInt(station.n, 10) || 0;
  // Mix year into the seed so changing year shifts the synthesised curves.
  const ySeed = stationSeed + year * 1009;
  for (let i = 1; i <= total; i++) {
    const r1 = seeded(ySeed, monthIndex, i);
    const r2 = seeded(ySeed, monthIndex + 31, i);
    const r3 = seeded(ySeed, monthIndex + 97, i);
    const r4 = seeded(ySeed, monthIndex + 211, i);
    const maxTemp = +(b.maxT + (r1 - 0.5) * 5).toFixed(1);
    const minTemp = +(b.minT + (r2 - 0.5) * 4).toFixed(1);
    // Rainfall is sparse & positively skewed.
    const isRainy = r3 > 0.75;
    const rainfall = isRainy
      ? +(b.rain + r3 * b.rain * 3).toFixed(1)
      : +((r3 < 0.5 ? 0 : r3 * 0.6) * b.rain).toFixed(1);
    const uvIndex = Math.max(
      0,
      Math.min(14, Math.round(b.uv + (r4 - 0.5) * 2)),
    );
    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    out.push({ day: i, date, maxTemp, minTemp, rainfall, uvIndex });
  }
  return out;
}

export function useStationDaily(station, monthIndex, year = DEFAULT_YEAR) {
  return useMemo(
    () => synthesiseStationDaily(station, monthIndex, year),
    [station, monthIndex, year],
  );
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Build a 12-row monthly series for a station+year by synthesising each month
// and averaging it. Shape is chart-friendly and matches the daily chart keys
// (maxTemp / minTemp / rainfall / uvIndex) so the existing chart components
// can render it without changes.
export function summariseYear(station, year = DEFAULT_YEAR) {
  if (!station) return [];
  const out = [];
  for (let m = 0; m < 12; m++) {
    const daily = synthesiseStationDaily(station, m, year);
    const s = summariseMonthly(daily);
    out.push({
      month: m,
      monthLabel: MONTH_LABELS[m],
      maxTemp: s.maxTemp,
      minTemp: s.minTemp,
      rainfall: s.rainfall,
      uvIndex: s.uvIndex,
      dryDaysPct: s.dryDaysPct,
      uvHighPct: s.uvHighPct,
    });
  }
  return out;
}

// Year-wide averages across the 12 monthly summaries.
export function averageYearSeries(yearSeries) {
  if (!yearSeries?.length) {
    return {
      maxTemp: 0, maxTempMin: 0, maxTempMax: 0,
      minTemp: 0, minTempMin: 0, minTempMax: 0,
      rainfall: 0, dryDaysPct: 0,
      uvIndex: 0, uvHighPct: 0,
    };
  }
  const n = yearSeries.length;
  const avg = (k) =>
    +(yearSeries.reduce((acc, r) => acc + r[k], 0) / n).toFixed(1);
  const mn = (k) => +yearSeries.reduce((a, r) => Math.min(a, r[k]), Infinity).toFixed(1);
  const mx = (k) => +yearSeries.reduce((a, r) => Math.max(a, r[k]), -Infinity).toFixed(1);
  return {
    maxTemp: avg("maxTemp"),
    maxTempMin: mn("maxTemp"),
    maxTempMax: mx("maxTemp"),
    minTemp: avg("minTemp"),
    minTempMin: mn("minTemp"),
    minTempMax: mx("minTemp"),
    rainfall: avg("rainfall"),
    dryDaysPct: Math.round(
      yearSeries.reduce((a, r) => a + r.dryDaysPct, 0) / n,
    ),
    uvIndex: avg("uvIndex"),
    uvHighPct: Math.round(
      yearSeries.reduce((a, r) => a + r.uvHighPct, 0) / n,
    ),
  };
}

// Month-average helper — used by KPI row and popups.
export function summariseMonthly(daily) {
  if (!daily?.length) {
    return {
      maxTemp: 0, maxTempMin: 0, maxTempMax: 0,
      minTemp: 0, minTempMin: 0, minTempMax: 0,
      rainfall: 0, dryDaysPct: 0,
      uvIndex: 0, uvHighPct: 0,
    };
  }
  const n = daily.length;
  const sum = (k) => daily.reduce((acc, d) => acc + d[k], 0);
  const min = (k) => daily.reduce((acc, d) => Math.min(acc, d[k]), Infinity);
  const max = (k) => daily.reduce((acc, d) => Math.max(acc, d[k]), -Infinity);
  const dryDays = daily.filter((d) => d.rainfall < 1).length;
  const uvHigh = daily.filter((d) => d.uvIndex >= 8).length;
  return {
    maxTemp: +(sum("maxTemp") / n).toFixed(1),
    maxTempMin: +min("maxTemp").toFixed(1),
    maxTempMax: +max("maxTemp").toFixed(1),
    minTemp: +(sum("minTemp") / n).toFixed(1),
    minTempMin: +min("minTemp").toFixed(1),
    minTempMax: +max("minTemp").toFixed(1),
    rainfall: +(sum("rainfall") / n).toFixed(1),
    dryDaysPct: Math.round((dryDays / n) * 100),
    uvIndex: +(sum("uvIndex") / n).toFixed(1),
    uvHighPct: Math.round((uvHigh / n) * 100),
  };
}
