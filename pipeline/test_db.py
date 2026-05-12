"""
Quick sanity check that we can reach the Neon Postgres database.

Run from repo root:
    python pipeline/test_db.py

If it prints database info + a list of tables, the connection works.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# load_dotenv() reads the .env file at the repo root and pushes each
# KEY=VALUE pair into os.environ for this process only.
load_dotenv()

# Pull the connection string. KeyError here means .env wasn't found
# or DATABASE_URL isn't set in it.
db_url = os.environ["DATABASE_URL"]

# create_engine() builds a connection pool. It does NOT open a socket yet —
# the first .connect() call is what actually talks to Neon.
engine = create_engine(db_url)

# `with engine.connect()` opens a connection and guarantees it's closed
# afterwards, even if the query raises.
with engine.connect() as conn:
    # text() wraps a raw SQL string so SQLAlchemy treats it as a statement.
    info = conn.execute(text("SELECT current_database(), current_user, version()")).one()
    print("Connected to:", info[0])
    print("As user:     ", info[1])
    print("Server:      ", info[2])

    # List the tables in the default schema so you can see what's available.
    tables = conn.execute(text("""
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
    """)).all()

    print(f"\nFound {len(tables)} tables visible to this user:")
    for schema, name in tables:
        print(f"  {schema}.{name}")

    # pg_class lists EVERY table in the database, regardless of grants.
    # If tables show up here but not above, it's a permissions problem.
    all_tables = conn.execute(text("""
        SELECT n.nspname, c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
          AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY n.nspname, c.relname
    """)).all()
    print(f"\nAll tables in database (regardless of permissions): {len(all_tables)}")
    for schema, name in all_tables:
        print(f"  {schema}.{name}")
