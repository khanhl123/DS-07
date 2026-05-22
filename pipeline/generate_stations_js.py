"""Regenerate dashboard/src/data/stations.js from Neon.

For each station, precomputes two parallel 12-element arrays — `monthlyScores`
and `monthlyConfidence` — by applying the research-backed expert model
(models/suitability_score_model.py) to the station's monthly climatology
(long-term means of max temp, min temp, rainfall, and UV index). Stations
missing one or more attributes are scored using the partial-data variant
of the model and tagged "partial"; the frontend renders those markers with
a dashed border to surface the lower confidence.

Also emits `missingAttrCount` per station — the number of weather attributes
(out of max/min/rain/UV) that are missing in the majority of months. The
map uses this to render data-poor stations (>= 3 missing) as solid grey
instead of falling back to a climatology-average colour, since the
climatology itself is untrustworthy when this many attributes are sparse.
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

from models.suitability_score_model import get_partial_suitability_verdict

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

    Returns (score, confidence) where confidence is "full" | "partial" | None.
    A None score (and None confidence) means the model can't produce a
    defensible number for this row — max_temp missing, or remaining weight
    after dropping unavailable components falls below the model's threshold.
    The inverted min/max case is logged and treated as missing min_temp.
    """
    if min_t is not None and max_t is not None and min_t > max_t:
        print(
            f"warn: dropped min_temp — inverted min/max ({min_t} > {max_t})",
            file=sys.stderr,
        )
        min_t = None
    rain = max(0.0, rain) if rain is not None else None
    try:
        v = get_partial_suitability_verdict(max_t, min_t, uv, rain)
    except ValueError as exc:
        print(f"warn: skipped score — model rejected row: {exc}", file=sys.stderr)
        return (None, None)
    if v["score"] is None:
        return (None, None)
    return (round(v["score"]), v["confidence"])


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

    # Half of the 12-month climatology window. An attribute that's present in
    # fewer months than this is treated as "missing" at the station level,
    # since a climatology aggregate built from <50% of months is too thin to
    # support the per-station average colour fallback used by the map.
    _ATTR_COVERAGE_THRESHOLD = 6

    def monthly_scores(station_number):
        months = by_station.get(station_number, {})
        scores = []
        confidences = []
        attr_present = {"max_t": 0, "min_t": 0, "rain": 0, "uv": 0}
        for m in range(1, 13):
            if m in months:
                max_t, min_t, rain, solar = months[m]
                uv = solar_to_uv(solar)
                if max_t is not None: attr_present["max_t"] += 1
                if min_t is not None: attr_present["min_t"] += 1
                if rain is not None:  attr_present["rain"]  += 1
                if uv is not None:    attr_present["uv"]    += 1
                s, c = expert_score(max_t, min_t, rain, uv)
            else:
                s, c = None, None
            scores.append(s)
            confidences.append(c)
        n_available = sum(1 for v in attr_present.values() if v >= _ATTR_COVERAGE_THRESHOLD)
        missing_attr_count = 4 - n_available
        return scores, confidences, missing_attr_count

    rows_out = []
    dropped = 0
    partial_count = 0
    full_count = 0
    low_data_count = 0
    for r in stations:
        sn = int(r.station_number)
        scores, confidences, missing_attr_count = monthly_scores(sn)
        # Single null contract: a None score must align with a None confidence.
        for s, c in zip(scores, confidences):
            assert (s is None) == (c is None), f"score/confidence mismatch for {sn}"
        # Drop stations where the model can't produce a defensible score for
        # any month — they'd render as 12 grey cells everywhere and offer no
        # value beyond cluttering the map.
        if all(s is None for s in scores):
            dropped += 1
            continue
        if any(c == "partial" for c in confidences):
            partial_count += 1
        elif any(c == "full" for c in confidences):
            full_count += 1
        if missing_attr_count >= 3:
            low_data_count += 1
        rows_out.append((r, scores, confidences, missing_attr_count))

    lines = [
        "// Auto-generated from Neon by pipeline/generate_stations_js.py.",
        f"// {len(rows_out)} BoM stations with daily history. monthlyScores + "
        f"monthlyConfidence precomputed by the expert marathon-suitability model "
        f"(models/suitability_score_model.py) on long-term monthly climatology. "
        f"confidence is 'full' (all 4 attributes) or 'partial' (model renormalised "
        f"over available attributes). missingAttrCount is the number of weather "
        f"attributes (max/min/rain/UV) present in fewer than half the months; "
        f">= 3 means the station is too data-poor for the climatology-average "
        f"colour fallback and the map renders it solid grey.",
        "",
        "export const STATIONS = [",
    ]
    for r, scores, confidences, missing_attr_count in rows_out:
        n = f"{int(r.station_number):06d}"
        state = CITY_TO_STATE.get(r.city_name, "")
        name = (r.station_name or "").replace('"', '\\"')
        lat = float(r.latitude)
        lng = float(r.longitude)
        # json.dumps emits `null` (valid JS) for Python `None`; Python repr would
        # emit `None`, which is invalid JS and would silently break the import.
        scores_js = json.dumps(scores)
        confidence_js = json.dumps(confidences)
        lines.append(
            f'  {{ n: "{n}", name: "{name}", state: "{state}", '
            f'city: "{r.city_name}", lat: {lat}, lng: {lng}, '
            f'monthlyScores: {scores_js}, '
            f'monthlyConfidence: {confidence_js}, '
            f'missingAttrCount: {missing_attr_count} }},'
        )
    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(rows_out)} stations to {OUT}")
    print(
        f"  full-coverage: {full_count}, with-partial-months: {partial_count}"
    )
    print(f"  data-poor (>= 3 missing attrs, rendered grey on map): {low_data_count}")
    print(f"Dropped {dropped} stations with no scoreable month.")


if __name__ == "__main__":
    main()
