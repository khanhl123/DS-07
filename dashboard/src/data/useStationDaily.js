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
  const sum = (k) => daily.reduce((acc, d) => acc + (d[k] ?? 0), 0);
  const min = (k) =>
    daily.reduce((acc, d) => Math.min(acc, d[k] ?? Infinity), Infinity);
  const max = (k) =>
    daily.reduce((acc, d) => Math.max(acc, d[k] ?? -Infinity), -Infinity);
  const dryDays = daily.filter((d) => (d.rainfall ?? 0) < 1).length;
  const uvHigh = daily.filter((d) => (d.uvIndex ?? 0) >= 8).length;
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
