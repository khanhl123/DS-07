"""Regenerate dashboard/src/data/stations.js from Neon.

For each station, precomputes a 12-element `monthlyScores` array by applying
the research-backed expert model (models/suitability_score_model.py) to the
station's monthly climatology (long-term means of max temp, min temp,
rainfall, and UV index). The frontend uses this directly — no threshold
slider, no client-side adjustment.
"""
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from models.suitability_score_model import get_suitability_score

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


def solar_to_uv(solar_mj):
    if solar_mj is None:
        return None
    return max(0.0, min(14.0, float(solar_mj) * 0.45))


def expert_score(max_t, min_t, rain, uv):
    """Expert marathon-suitability score for one monthly aggregate.

    Returns None when any of max_t / min_t / uv is missing, when the model
    rejects the row (e.g. inverted min/max from sparse data), or when the
    row would otherwise produce a misleading result. The frontend treats
    None as "missing data, score not available". Missing rainfall alone is
    clamped to 0 — same defensive behaviour as the API.
    """
    if max_t is None or min_t is None or uv is None:
        return None
    if min_t > max_t:
        print(
            f"warn: skipped score — inverted min/max ({min_t} > {max_t})",
            file=sys.stderr,
        )
        return None
    rain = 0.0 if rain is None else max(0.0, rain)
    try:
        return round(get_suitability_score(max_t, min_t, uv, rain))
    except ValueError as exc:
        print(f"warn: skipped score — model rejected row: {exc}", file=sys.stderr)
        return None


OUT = Path(__file__).resolve().parents[1] / "dashboard" / "src" / "data" / "stations.js"


def main():
    load_dotenv()
    engine = create_engine(os.environ["DATABASE_URL"])

    with engine.connect() as conn:
        stations = conn.execute(text("""
            SELECT station_number, station_name, city_name, latitude, longitude
            FROM stations
            WHERE city_name IS NOT NULL
            ORDER BY station_number
        """)).all()

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
                out.append(expert_score(max_t, min_t, rain, uv))
            else:
                out.append(None)
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
        f"monthlyScores precomputed by the expert marathon-suitability model "
        f"(models/suitability_score_model.py) on long-term monthly climatology.",
        "",
        "export const STATIONS = [",
    ]
    for r, scores in rows_out:
        n = f"{int(r.station_number):06d}"
        state = CITY_TO_STATE.get(r.city_name, "")
        name = (r.station_name or "").replace('"', '\\"')
        lat = float(r.latitude)
        lng = float(r.longitude)
        # json.dumps emits `null` (valid JS) for Python `None`; Python repr would
        # emit `None`, which is invalid JS and would silently break the import.
        scores_js = json.dumps(scores)
        lines.append(
            f'  {{ n: "{n}", name: "{name}", state: "{state}", '
            f'city: "{r.city_name}", lat: {lat}, lng: {lng}, '
            f'monthlyScores: {scores_js} }},'
        )
    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(rows_out)} stations to {OUT}")
    print(f"Dropped {dropped} stations with no daily history.")


if __name__ == "__main__":
    main()
