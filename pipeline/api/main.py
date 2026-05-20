"""FastAPI service for the marathon weather dashboard.

Run from repo root:
    uvicorn pipeline.api.main:app --reload --port 8000
"""
import os
from datetime import date
from calendar import monthrange

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

load_dotenv()

engine = create_engine(
    os.environ["DATABASE_URL"],
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
)

app = FastAPI(title="Marathon Weather API")

# Comma-separated allowlist; defaults cover local Vite dev (both 5173 and 5174).
_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174"
)
CORS_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def solar_to_uv(solar_mj):
    """Rough conversion from daily solar exposure (MJ/m²) to peak UV index.

    Empirical fit: AU summer ~28 MJ → UVI ~12-13; winter ~8 MJ → UVI ~3.
    Returns None when the input is missing so the dashboard can render
    a gap instead of falsely reporting UV 0.
    """
    if solar_mj is None:
        return None
    uv = round(float(solar_mj) * 0.45)
    return max(0, min(14, uv))


def _round1(v):
    return round(float(v), 1) if v is not None else None


def _row_to_daily(r):
    return {
        "day": r.observation_date.day,
        "date": r.observation_date.isoformat(),
        "maxTemp": _round1(r.max_temp),
        "minTemp": _round1(r.min_temp),
        "rainfall": _round1(r.rainfall_mm) if r.rainfall_mm is not None else 0.0,
        "uvIndex": solar_to_uv(r.solar_exposure_mj),
    }


@app.get("/api/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/api/stations/{station_number}/daily")
def station_daily(station_number: int, year: int, month: int):
    """Daily observations for one station / month."""
    if not 1 <= month <= 12:
        raise HTTPException(400, "month must be 1..12")
    last = monthrange(year, month)[1]
    start = date(year, month, 1)
    end = date(year, month, last)
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT observation_date, max_temp, min_temp,
                       rainfall_mm, solar_exposure_mj
                FROM daily_weather
                WHERE station_number = :n
                  AND observation_date BETWEEN :start AND :end
                ORDER BY observation_date
            """),
            {"n": station_number, "start": start, "end": end},
        ).all()
    return [_row_to_daily(r) for r in rows]


@app.get("/api/stations/{station_number}/yearly")
def station_yearly(station_number: int, year: int):
    """12 monthly aggregates for one station / year — matches summariseYear shape."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT
                  EXTRACT(MONTH FROM observation_date)::int        AS month,
                  AVG(max_temp)::float                             AS max_temp,
                  MIN(max_temp)::float                             AS max_temp_min,
                  MAX(max_temp)::float                             AS max_temp_max,
                  AVG(min_temp)::float                             AS min_temp,
                  MIN(min_temp)::float                             AS min_temp_min,
                  MAX(min_temp)::float                             AS min_temp_max,
                  AVG(rainfall_mm)::float                          AS rainfall,
                  AVG(solar_exposure_mj)::float                    AS solar,
                  SUM((rainfall_mm < 1)::int)::float
                    / NULLIF(COUNT(*), 0)                          AS dry_frac,
                  SUM((solar_exposure_mj * 0.45 >= 8)::int)::float
                    / NULLIF(COUNT(*), 0)                          AS uv_high_frac
                FROM daily_weather
                WHERE station_number = :n
                  AND EXTRACT(YEAR FROM observation_date) = :y
                GROUP BY month
                ORDER BY month
            """),
            {"n": station_number, "y": year},
        ).all()

    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    out = []
    for r in rows:
        m0 = r.month - 1
        out.append({
            "month": m0,
            "monthLabel": labels[m0],
            "maxTemp": _round1(r.max_temp),
            "maxTempMin": _round1(r.max_temp_min),
            "maxTempMax": _round1(r.max_temp_max),
            "minTemp": _round1(r.min_temp),
            "minTempMin": _round1(r.min_temp_min),
            "minTempMax": _round1(r.min_temp_max),
            "rainfall": _round1(r.rainfall),
            "uvIndex": solar_to_uv(r.solar),
            "dryDaysPct": round(r.dry_frac * 100) if r.dry_frac is not None else None,
            "uvHighPct": round(r.uv_high_frac * 100) if r.uv_high_frac is not None else None,
        })
    return out


@app.get("/api/stations/{station_number}/years")
def station_years(station_number: int):
    """Distinct years available for a station — to populate the year selector."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT DISTINCT EXTRACT(YEAR FROM observation_date)::int AS y
                FROM daily_weather
                WHERE station_number = :n
                ORDER BY y DESC
            """),
            {"n": station_number},
        ).all()
    return [r.y for r in rows]
