// Step 3 suitability score.
//
//   score = round(climatology × passRate / 100)
//
// where:
//   - climatology  = the Python expert model's verdict on the station/month's
//                    typical weather (acts as a CEILING; the score cannot
//                    exceed it). Supplied by the caller from
//                    yearMonth.marathonVerdict.score or the baked monthly
//                    score in stations.js.
//   - passRate (%) = share of days in the loaded period whose four actual
//                    weather metrics all meet the user's slider thresholds.
//
// The four slider thresholds are the only user-controlled inputs that move
// the score. The default slider values are themselves a strictness setting
// (sensible marathon limits) — at defaults, a handful of outlier days
// normally fail, so the default-state score sits slightly below the
// climatology rather than exactly on it. Loosening sliders climbs back
// toward the climatology ceiling; tightening drops below it.

export const DEFAULT_THRESHOLDS = Object.freeze({
  maxTemp: 28,
  minTemp: 0,
  rainfall: 5,
  uvIndex: 7,
});

function isFiniteDay(d) {
  return (
    d &&
    Number.isFinite(d.maxTemp) &&
    Number.isFinite(d.minTemp) &&
    Number.isFinite(d.rainfall) &&
    Number.isFinite(d.uvIndex)
  );
}

function dayMeetsAll(d, t) {
  return (
    d.maxTemp <= t.maxTemp &&
    d.minTemp >= t.minTemp &&
    d.rainfall <= t.rainfall &&
    d.uvIndex <= t.uvIndex
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

export function computeSuitabilityScore(climatology, passRate) {
  if (climatology == null || passRate == null) return null;
  return Math.round((climatology * passRate) / 100);
}
