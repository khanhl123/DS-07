# DS-07

Marathon Weather Dashboard — historical BoM weather suitability tool for marathon planning.

- **Frontend:** Vite + React 19 in `dashboard/` (deploys to Vercel)
- **Backend:** FastAPI in `pipeline/api/` (deploys to Render, reads from Neon Postgres)

## Local development

Backend (port 8000):
```
cp .env.example .env   # fill in DATABASE_URL
pip install -r pipeline/api/requirements.txt
uvicorn pipeline.api.main:app --reload --port 8000
```

Frontend (port 5173, proxies `/api` → `127.0.0.1:8000`):
```
npm --prefix dashboard install
npm --prefix dashboard run dev
```

## Regenerating `stations.js`

`dashboard/src/data/stations.js` is a generated file. It bakes in each station's
coordinates **and** a 12-element `monthlyScores` array precomputed from
historical climatology in Neon — these power the map dot colours, MonthStrip
ranking, and "best month" labels without a runtime DB hit per station.

Re-run the generator whenever the daily-weather corpus changes (new BoM years
ingested, new stations onboarded, dropped stations, threshold defaults
changed):

```
python pipeline/generate_stations_js.py
```

Then commit the regenerated `dashboard/src/data/stations.js` alongside any
pipeline changes that triggered it. There is no CI job that automates this —
fresh BoM years will not appear on the map until the script is re-run by hand.
