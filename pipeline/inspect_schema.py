"""One-off: inspect tables, columns, and sample rows."""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:
    for table in ("stations", "daily_weather"):
        print(f"\n=== {table} ===")
        cols = conn.execute(text("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name=:t
            ORDER BY ordinal_position
        """), {"t": table}).all()
        for c in cols:
            print(f"  {c[0]}: {c[1]}")
        try:
            n = conn.execute(text(f"SELECT COUNT(*) FROM public.{table}")).scalar()
            print(f"  rows: {n}")
            sample = conn.execute(text(f"SELECT * FROM public.{table} LIMIT 3")).all()
            for r in sample:
                print(" ", dict(r._mapping))
        except Exception as e:
            print(f"  SELECT failed: {e}")
