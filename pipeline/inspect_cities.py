import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:
    cities = conn.execute(text(
        "SELECT DISTINCT city_name, COUNT(*) AS n FROM stations GROUP BY city_name ORDER BY n DESC"
    )).all()
    print(f"{len(cities)} distinct cities:")
    for c, n in cities:
        print(f"  {c}: {n}")

    yr = conn.execute(text(
        "SELECT MIN(observation_date), MAX(observation_date) FROM daily_weather"
    )).one()
    print(f"\nDate range: {yr[0]} → {yr[1]}")
