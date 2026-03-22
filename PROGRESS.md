# PROGRESS.md

## Purpose

* Split this one into 1 file for Raw-Data Branch and 1 for main 
This file is an internal Codex working note.

Use `PROJECT_SCOPE.md` as the team-facing source of truth for scope, deliverables, and change control.
Do not use this file as the main project brief for humans.

Use this file when the user asks to:

- check progress
- update progress
- continue from the current repo state
- re-run the progress review

The goal is to tell Codex exactly what to inspect first, where the main data artifacts live, and what is already known.

---

## Current Baseline For Codex

The completed stage so far is the data-cleaning foundation.

Current implemented assets:

- cleaning pipeline: `scripts/clean_bom_daily.py`
- raw input folders:
  - `data max temp`
  - `data min temp`
  - `data rainfall`
  - `data UV`
- cleaned output folders:
  - `cleaned/full/`
  - `cleaned/observed/`
  - `cleaned/strict/`
- metadata:
  - `cleaned/metadata/stations_master.csv`
  - `cleaned/metadata/station_aliases.csv`
- reports:
  - `cleaned/reports/coverage_summary.csv`
  - `cleaned/reports/data_issues.csv`
  - `cleaned/reports/metadata_conflicts.csv`

Current cleaned metrics:

- `max_temp`
- `min_temp`
- `rainfall`
- `uv`

Current known cleaned state coverage:

- `NSW`
- `NT`
- `TAS`
- `VIC`

Current known missing product layers:

- no frontend scaffold
- no map UI
- no dashboard UI
- no suitability logic implementation
- no deployment config
- no formal test suite

---

## First Files To Check By Task Type

### Scope And Priorities

Check first:

- `PROJECT_SCOPE.md`

Use this when the task is about:

- what is in scope
- what is out of scope
- what phase comes next
- what requirement IDs the work should map to

### Cleaning Logic

Check first:

- `scripts/clean_bom_daily.py`

Use this when the task is about:

- how raw BoM files are parsed
- how cleaned outputs are generated
- how metadata fields are extracted
- why a data issue exists in the cleaned outputs

### Coverage And Metric Availability

Check first:

- `cleaned/reports/coverage_summary.csv`

Use this when the task is about:

- which stations have which metrics
- date ranges by station and metric
- observed vs strict row counts
- whether a location supports enough data for analysis

### Station Metadata And Mapping

Check first:

- `cleaned/metadata/stations_master.csv`
- `cleaned/metadata/station_aliases.csv`
- `cleaned/reports/metadata_conflicts.csv`

Use this when the task is about:

- latitude and longitude
- station names
- station aliases
- station-level metadata conflicts
- mapping support

### Data Quality Investigation

Check first:

- `cleaned/reports/data_issues.csv`
- `scripts/clean_bom_daily.py`

Use this when the task is about:

- parsing issues
- blank values
- metadata issues
- suspicious outputs

### Daily Analysis Inputs

Preferred starting files:

- `cleaned/strict/` for safer day-level analysis
- `cleaned/observed/` when actual measured values are needed but missing rows can be ignored
- `cleaned/full/` when completeness, blanks, or raw-to-clean validation is needed

### Raw Source Validation

Check the raw folders only when needed:

- `data max temp`
- `data min temp`
- `data rainfall`
- `data UV`

Use this when the cleaned output looks wrong and the issue may come from the source files or note files.

---

## Known Caveats

- `humidity` and `wind speed` are not yet present in the repo as cleaned datasets.
- Current cleaned coverage is not Australia-wide.
- Not every station has every metric.
- `year_closed` in `cleaned/metadata/stations_master.csv` should currently be treated as unreliable until the parser is fixed.
- `PROJECT_SCOPE.md` is the human-facing control document. This file should stay operational and concise.

---

## Codex Checklist For Future "Run PROGRESS.md" Requests

When asked to check progress again, do this in order:

1. Read `PROJECT_SCOPE.md` to confirm the current official scope and phase order.
2. Read this file to get the last known operational baseline.
3. Inspect the specific files listed above that match the user request.
4. If the task is data-related, start with `coverage_summary.csv`, `stations_master.csv`, `data_issues.csv`, and `clean_bom_daily.py`.
5. If the task is scope-related, map the work to the relevant scope phase or requirement IDs.
6. Update this file only after confirming the current repo state from actual files.

---

## Update Rules For This File

When editing `PROGRESS.md` in the future:

- keep it short and operational
- record what has changed in the repo, not broad project background
- include exact file paths that a future Codex run should inspect
- note any newly discovered caveats or blockers
- reference the relevant scope phase or requirement IDs when useful
- avoid repeating long explanations that already belong in `PROJECT_SCOPE.md`

---

## Current Recommended Next Checks

Based on the current repo and scope, the next highest-value checks are:

- verify and fix the `year_closed` parsing issue in `scripts/clean_bom_daily.py`
- inspect `cleaned/reports/coverage_summary.csv` to decide which stations are strong enough for downstream aggregation
- build derived monthly, quarterly, and annual outputs from the cleaned daily data

---

## Short Internal Summary

The repo currently has a usable cleaning pipeline and cleaned daily weather outputs. If a future Codex run needs to resume work, start with `PROJECT_SCOPE.md` for scope, then use this file to jump directly to the right pipeline, metadata, report, or cleaned data files.
