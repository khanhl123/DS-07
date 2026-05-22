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

export function buildDailyUrl(station, monthIndex, year) {
  if (!station) return null;
  return (
    `/api/stations/${Number.parseInt(station.n, 10)}/daily` +
    `?year=${year}&month=${monthIndex + 1}`
  );
}

export function buildPredictedUrl(station, monthIndex, year) {
  if (!station) return null;
  return (
    `/api/stations/${Number.parseInt(station.n, 10)}/predicted` +
    `?year=${year}&month=${monthIndex + 1}` +
    `&lat=${station.lat}&lng=${station.lng}`
  );
}

export function useStationDaily(station, monthIndex, year, enabled = true) {
  const url = enabled ? buildDailyUrl(station, monthIndex, year) : null;
  return useFetched(url, EMPTY_ARRAY);
}

// Default enabled=false: prediction is expensive, callers must opt in.
export function useStationPredicted(station, monthIndex, year, enabled = false) {
  const url = enabled ? buildPredictedUrl(station, monthIndex, year) : null;
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
// Missing monthly values are excluded per-field so a sparse field
// doesn't drag the year average toward zero.
export function averageYearSeries(yearSeries) {
  const empty = {
    maxTemp: null, maxTempMin: null, maxTempMax: null,
    minTemp: null, minTempMin: null, minTempMax: null,
    rainfall: null, dryDaysPct: null,
    uvIndex: null, uvHighPct: null,
  };
  if (!yearSeries?.length) return empty;

  const present = (k) =>
    yearSeries.map((r) => r[k]).filter((v) => v != null);
  const avg1 = (vals) =>
    vals.length ? +(vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : null;
  const min1 = (vals) =>
    vals.length ? +Math.min(...vals).toFixed(1) : null;
  const max1 = (vals) =>
    vals.length ? +Math.max(...vals).toFixed(1) : null;
  const pctRound = (vals) =>
    vals.length ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : null;

  return {
    maxTemp: avg1(present("maxTemp")),
    maxTempMin: min1(present("maxTempMin")),
    maxTempMax: max1(present("maxTempMax")),
    minTemp: avg1(present("minTemp")),
    minTempMin: min1(present("minTempMin")),
    minTempMax: max1(present("minTempMax")),
    rainfall: avg1(present("rainfall")),
    dryDaysPct: pctRound(present("dryDaysPct")),
    uvIndex: avg1(present("uvIndex")),
    uvHighPct: pctRound(present("uvHighPct")),
  };
}

// Month aggregate — used by the KPI row and the RiskProfile card in
// daily mode. The "Expert" verdict shown in station popups is sourced
// from the /yearly endpoint instead so the popup, the yearly chart, and
// the API all agree on a single monthly value (the model computed once
// on monthly-averaged inputs). Averaging per-day scores client-side here
// produced a different number from the same model called on monthly
// averages because the sub-score functions are step functions.
// Missing values are excluded from each metric independently so a sparse
// field doesn't drag the average toward zero or mark gaps as "dry".
export function summariseMonthly(daily) {
  // null (not 0) so KPI cards render "—" instead of misleading "0°C / 0 mm"
  // when a field is completely missing for the period.
  const empty = {
    maxTemp: null, maxTempMin: null, maxTempMax: null,
    minTemp: null, minTempMin: null, minTempMax: null,
    rainfall: null, dryDaysPct: null,
    uvIndex: null, uvHighPct: null,
  };
  if (!daily?.length) return empty;

  const present = (k) =>
    daily.map((d) => d[k]).filter((v) => v != null);
  const avg1 = (vals) =>
    vals.length ? +(vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : null;
  const min1 = (vals) =>
    vals.length ? +Math.min(...vals).toFixed(1) : null;
  const max1 = (vals) =>
    vals.length ? +Math.max(...vals).toFixed(1) : null;
  const pct = (vals, pred) =>
    vals.length ? Math.round((vals.filter(pred).length / vals.length) * 100) : null;

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
