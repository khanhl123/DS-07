// Hooks that fetch daily / yearly weather from the FastAPI backend.
// Returned data shapes match the previous synthetic version so chart,
// calendar, and KPI components don't need to change. Each hook also
// exposes { loading, error } for UI banners.

import { useEffect, useState } from "react";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

function useFetched(url, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setData(fallback);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchJSON(url)
      .then((rows) => {
        if (cancelled) return;
        setData(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(url, err);
        setData(fallback);
        setError(err);
        setLoading(false);
      });
    return () => { cancelled = true; };
    // fallback intentionally excluded — pass a stable reference from callers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
}

const EMPTY_ARRAY = [];

// Daily array for one station + month.
// Shape: [{ day, date, maxTemp, minTemp, rainfall, uvIndex }, ...]
export function useStationDaily(station, monthIndex, year) {
  const url = station
    ? `/api/stations/${Number.parseInt(station.n, 10)}/daily` +
      `?year=${year}&month=${monthIndex + 1}`
    : null;
  return useFetched(url, EMPTY_ARRAY);
}

// 12 monthly aggregates for one station + year.
export function useStationYearly(station, year, enabled = true) {
  const url = station && enabled
    ? `/api/stations/${Number.parseInt(station.n, 10)}/yearly?year=${year}`
    : null;
  return useFetched(url, EMPTY_ARRAY);
}

// Distinct years available for one station (descending).
export function useStationYears(station) {
  const url = station
    ? `/api/stations/${Number.parseInt(station.n, 10)}/years`
    : null;
  return useFetched(url, EMPTY_ARRAY);
}

// Year-wide averages — used by KPI row when granularity = monthly.
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
  const mn = (k) =>
    +yearSeries.reduce((a, r) => Math.min(a, r[k]), Infinity).toFixed(1);
  const mx = (k) =>
    +yearSeries.reduce((a, r) => Math.max(a, r[k]), -Infinity).toFixed(1);
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

// Month aggregate — used by KPI row in daily mode and station popups.
// Missing values are excluded from each metric independently so a sparse
// field doesn't drag the average toward zero or mark gaps as "dry".
export function summariseMonthly(daily) {
  const empty = {
    maxTemp: 0, maxTempMin: 0, maxTempMax: 0,
    minTemp: 0, minTempMin: 0, minTempMax: 0,
    rainfall: 0, dryDaysPct: 0,
    uvIndex: 0, uvHighPct: 0,
  };
  if (!daily?.length) return empty;

  const present = (k) =>
    daily.map((d) => d[k]).filter((v) => v != null);
  const avg1 = (vals) =>
    vals.length ? +(vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : 0;
  const min1 = (vals) =>
    vals.length ? +Math.min(...vals).toFixed(1) : 0;
  const max1 = (vals) =>
    vals.length ? +Math.max(...vals).toFixed(1) : 0;
  const pct = (vals, pred) =>
    vals.length ? Math.round((vals.filter(pred).length / vals.length) * 100) : 0;

  const maxTempVals = present("maxTemp");
  const minTempVals = present("minTemp");
  const rainfallVals = present("rainfall");
  const uvVals = present("uvIndex");

  return {
    maxTemp: avg1(maxTempVals),
    maxTempMin: min1(maxTempVals),
    maxTempMax: max1(maxTempVals),
    minTemp: avg1(minTempVals),
    minTempMin: min1(minTempVals),
    minTempMax: max1(minTempVals),
    rainfall: avg1(rainfallVals),
    dryDaysPct: pct(rainfallVals, (v) => v < 1),
    uvIndex: avg1(uvVals),
    uvHighPct: pct(uvVals, (v) => v >= 8),
  };
}
