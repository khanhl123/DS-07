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
