"""Regenerate dashboard/src/data/stations.js from Neon.

For each station, also precomputes a 12-element `monthlyScores` array from real
historical means. Score formula mirrors `scoreDayAgainstThresholds` in
placeholderData.js against the default thresholds (maxTemp 26, minTemp 8,
rainfall 4, uv 6), so map dot colours, MonthStrip ranking, comparison tray,
and "best month" labels all reflect real climate rather than a lat heuristic.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

CITY_TO_STATE = {
    "Sydney": "NSW",
    "Darwin": "NT",
    "Adelaide": "SA",
    "Hobart": "TAS",
    "Melbourne": "VIC",
    "Melbournre": "VIC",  # known typo in source data
    "Brisbane": "QLD",
    "Perth": "WA",
    "Canberra": "ACT",
}

# Mirror DEFAULT_THRESHOLDS in placeholderData.js
DEFAULTS = {"maxTemp": 26.0, "minTemp": 8.0, "rainfall": 4.0, "uv": 6.0}


def solar_to_uv(solar_mj):
    if solar_mj is None:
        return 0.0
    return max(0.0, min(14.0, float(solar_mj) * 0.45))


def score_day(max_t, min_t, rain, uv):
    """Port of scoreDayAgainstThresholds — applied here to monthly means."""
    score = 100.0
    if max_t is None or min_t is None:
        return 0
    if max_t > DEFAULTS["maxTemp"]:
        score -= (max_t - DEFAULTS["maxTemp"]) * 5
    # Intentional cold-weather floor independent of minTemp slider: days where
    # the *daytime high* stays below 10 °C are unsuitable for most runners
    # regardless of how low the user's minTemp tolerance is. Keep in sync with
    # scoreDayAgainstThresholds in dashboard/src/data/placeholderData.js.
    if max_t < 10:
        score -= (10 - max_t) * 3
    if min_t < DEFAULTS["minTemp"]:
        score -= (DEFAULTS["minTemp"] - min_t) * 3
    if rain is not None and rain > DEFAULTS["rainfall"]:
        score -= (rain - DEFAULTS["rainfall"]) * 8
    if uv > DEFAULTS["uv"]:
        score -= (uv - DEFAULTS["uv"]) * 6
    return max(0, min(100, round(score)))


OUT = Path(__file__).resolve().parents[1] / "dashboard" / "src" / "data" / "stations.js"

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:
    stations = conn.execute(text("""
        SELECT station_number, station_name, city_name, latitude, longitude
        FROM stations
        WHERE city_name IS NOT NULL
        ORDER BY station_number
    """)).all()

    # One scan over daily_weather, grouped by station + month.
    # Uses all available years per station for stable climatology.
    print(f"Aggregating {len(stations)} stations × 12 months from daily_weather…")
    agg = conn.execute(text("""
        SELECT
          station_number,
          EXTRACT(MONTH FROM observation_date)::int AS month,
          AVG(max_temp)::float           AS max_t,
          AVG(min_temp)::float           AS min_t,
          AVG(rainfall_mm)::float        AS rain,
          AVG(solar_exposure_mj)::float  AS solar
        FROM daily_weather
        GROUP BY station_number, month
    """)).all()

# {station_number: {month: (max, min, rain, solar)}}
by_station = {}
for r in agg:
    by_station.setdefault(r.station_number, {})[r.month] = (
        r.max_t, r.min_t, r.rain, r.solar,
    )


def monthly_scores(station_number):
    months = by_station.get(station_number, {})
    out = []
    for m in range(1, 13):
        if m in months:
            max_t, min_t, rain, solar = months[m]
            uv = solar_to_uv(solar)
            out.append(score_day(max_t, min_t, rain, uv))
        else:
            out.append(0)
    return out


rows_out = []
dropped = 0
for r in stations:
    sn = int(r.station_number)
    months = by_station.get(sn, {})
    # Require at least one month with temperature data — rainfall-only
    # stations (e.g. Herne Hill) can't be scored for marathon suitability.
    has_temp = any(
        v[0] is not None and v[1] is not None for v in months.values()
    )
    if not has_temp:
        dropped += 1
        continue
    rows_out.append((r, monthly_scores(sn)))

lines = [
    "// Auto-generated from Neon by pipeline/generate_stations_js.py.",
    f"// {len(rows_out)} BoM stations with daily history. "
    f"monthlyScores precomputed from real climatology.",
    "",
    "export const STATIONS = [",
]
for r, scores in rows_out:
    n = f"{int(r.station_number):06d}"
    state = CITY_TO_STATE.get(r.city_name, "")
    name = (r.station_name or "").replace('"', '\\"')
    lat = float(r.latitude)
    lng = float(r.longitude)
    lines.append(
        f'  {{ n: "{n}", name: "{name}", state: "{state}", '
        f'city: "{r.city_name}", lat: {lat}, lng: {lng}, '
        f'monthlyScores: {scores} }},'
    )
lines.append("];")
lines.append("")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(rows_out)} stations to {OUT}")
print(f"Dropped {dropped} stations with no daily history.")
