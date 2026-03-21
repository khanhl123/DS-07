# PROJECT_SCOPE.md

## 1. Purpose

This file is the authoritative scope baseline for the DS-07 project.

Its job is to keep future work aligned to the same agreed direction.
Any new feature, analysis task, UI task, data task, or progress update should be checked against this document before work starts.

This file is intentionally written as a working project-control document, not as proposal-only report text.

Rules:

- this file defines what the team is building
- this file defines what the team is not building
- future progress should reference one or more scope sections or requirement IDs from this file
- work that changes the agreed scope must update this file before implementation begins

---

## 2. Project Goal

The target product is an interactive web-based weather visualisation and decision-support tool for marathon planning.

The intended end-state is a system that helps organisers compare supported locations, inspect weather trends over time, and view an explainable suitability indication for possible marathon timing.

This is a decision-support product. It is not an automatic approval system and it does not replace human judgement, safety review, or event operations planning.

---

## 3. Current Repo Baseline

The current repository already contains a completed data-cleaning stage.

### 3.1 Implemented Baseline

The repo currently includes:

- a cleaning pipeline in `scripts/clean_bom_daily.py`
- raw BoM daily data folders for:
  - `data max temp`
  - `data min temp`
  - `data rainfall`
  - `data UV`
- cleaned outputs in:
  - `cleaned/full/`
  - `cleaned/observed/`
  - `cleaned/strict/`
- metadata outputs:
  - `cleaned/metadata/stations_master.csv`
  - `cleaned/metadata/station_aliases.csv`
- report outputs:
  - `cleaned/reports/coverage_summary.csv`
  - `cleaned/reports/data_issues.csv`
  - `cleaned/reports/metadata_conflicts.csv`
- an internal Codex working note in `PROGRESS.md`

### 3.2 Current Supported Cleaned Metrics

The cleaned pipeline currently supports:

- `max_temp`
- `min_temp`
- `rainfall`
- `uv`

These are the only weather metrics that should be treated as currently available in the repo.

### 3.3 Current Geographic Coverage

Based on the current cleaned metadata, supported stations are currently limited to these states:

- `NSW`
- `NT`
- `TAS`
- `VIC`

The project should not currently claim full Australia-wide cleaned coverage.

### 3.4 Current Data Realism Notes

- Daily cleaned historical data exists now.
- Monthly, quarterly, and annual views do not yet exist as produced outputs and must be derived from the daily cleaned data.
- Cross-metric overlap is limited. Not every station has every currently supported metric.
- `stations_master.csv` is usable for location mapping, but `year_closed` should currently be treated as unreliable until the parsing issue is fixed.

### 3.5 What Does Not Yet Exist

The repo does not currently contain:

- a web app scaffold
- an interactive map UI
- a dashboard UI
- derived aggregation tables for monthly, quarterly, or annual summaries
- a suitability scoring or prediction implementation
- deployment configuration
- a test harness for unit, integration, or system testing

---

## 4. Scope Baseline

This section defines the official scope for future work.

### 4.1 In Scope

#### Phase A. Data Foundation

- maintain and improve the reproducible BoM cleaning pipeline
- preserve raw input data unchanged
- fix confirmed data-quality issues that block downstream use
- maintain cleaned daily outputs and supporting metadata/reports

#### Phase B. Derived Analysis Data

- generate monthly, quarterly, and annual aggregations from cleaned daily data
- document aggregation rules clearly
- expose station-level and metric-level coverage clearly enough for downstream filtering

#### Phase C. Spatial and Dashboard Application

- build a web-based interface
- provide supported location selection using station metadata and map-based interaction
- provide linked filtering between location, metric, and time selection
- provide trend visualisations for currently supported metrics

#### Phase D. Suitability Logic

- implement a first acceptable suitability method using explainable rule-based logic
- show suitability in a simple categorical form such as green/yellow/red or equivalent
- document how suitability is calculated
- optionally extend to a more advanced model later, but only after the rule-based version exists and is understood

#### Phase E. Delivery Quality

- deploy a usable web version
- add unit, integration, and system-level testing where appropriate
- maintain core documentation that explains data flow, scope, and project decisions

### 4.2 Planned But Not Yet Supported Inputs

The following are part of the broader product direction but are not current must-have implementation commitments until the required datasets exist in this repo:

- humidity
- wind speed

These remain dependencies, not currently available baseline inputs.

### 4.3 Rainfall Position

Rainfall is currently available and may be used as an auxiliary planning signal.
It does not replace the original intent to eventually include other marathon-relevant weather variables such as humidity and wind speed.

---

## 5. Out of Scope

The following items are out of scope unless this file is explicitly updated first:

- real-time live weather feeds for race-day monitoring
- runner registration systems
- payment or ticketing systems
- logistics planning such as road closures, staffing, medical scheduling, or budgeting
- route generation or turn-by-turn course design
- custom GIS editing tools
- native mobile apps
- enterprise-grade cloud architecture or high-availability infrastructure
- medical or legal certification of safe event conditions
- multi-country support
- personalised recommendations for individual runners

Out-of-scope work must not displace in-scope delivery.

---

## 6. Functional Requirements

### FR-01 Reproducible Data Pipeline

The project shall maintain a repeatable workflow for collecting, cleaning, and producing structured BoM daily weather outputs.

### FR-02 Supported Weather Metrics

The system shall support the currently cleaned metrics `max_temp`, `min_temp`, `rainfall`, and `uv`.

### FR-03 Location Metadata Support

The system shall maintain station metadata sufficient for supported location selection and spatial display.

### FR-04 Derived Time Aggregations

The project shall derive monthly, quarterly, and annual summaries from cleaned daily data before those views are exposed in the application.

### FR-05 Location Selection

The application shall allow users to select a supported location for inspection.

### FR-06 Trend Visualisation

The application shall display trend views for supported metrics and supported time granularities.

### FR-07 Linked Filtering

The application shall update relevant views when the user changes location, metric, or time selection.

### FR-08 Explainable Suitability Output

The application shall provide an explainable suitability result for marathon planning based on available project data.

### FR-09 Dashboard Integration

The application shall combine location selection, time filtering, trend views, and suitability output in one usable interface.

### FR-10 Deployment

The project shall produce a browser-accessible deployed version of the application.

### FR-11 Testing Support

The project shall be implemented in a way that supports unit, integration, and system testing.

### FR-12 Documentation Alignment

The project shall maintain documentation that links delivered work back to this scope baseline.

---

## 7. Non-Functional Requirements

### NFR-01 Reproducibility

Data preparation and derived outputs shall be reproducible from documented scripts or workflows.

### NFR-02 Usability

The application shall be understandable to non-technical users performing planning tasks.

### NFR-03 Accessibility

The interface shall follow practical readability and accessibility principles such as clear labels, understandable layout, and readable visual contrast.

### NFR-04 Reliability

The system shall behave predictably when data are incomplete, unavailable, or filtered down to limited coverage.

### NFR-05 Maintainability

The codebase shall stay modular enough for team collaboration, debugging, and post-submission review.

### NFR-06 Browser Compatibility

The final application shall run in a standard modern browser without requiring specialist local software.

### NFR-07 Performance

The deployed application should load core content within a reasonable time for a student project and avoid obviously slow interactions on supported data volumes.

---

## 8. Known Gaps And Dependencies

These items are real gaps between the current repo and the target product.

### 8.1 Missing Data Inputs

- humidity data not yet acquired or cleaned
- wind speed data not yet acquired or cleaned

### 8.2 Missing Derived Data Products

- monthly summaries not yet built
- quarterly summaries not yet built
- annual summaries not yet built

### 8.3 Missing Application Layers

- no frontend scaffold
- no map interaction layer
- no dashboard implementation
- no suitability implementation
- no deployment workflow
- no formal test suite

### 8.4 Current Data Quality Risk

- `year_closed` in `cleaned/metadata/stations_master.csv` should not currently be treated as trusted metadata until fixed

---

## 9. Phase-Based Delivery Order

Future work should follow this order unless a documented exception is agreed.

### Phase 1

Stabilise the data foundation.

Focus:

- validate cleaned outputs
- fix blocking metadata issues
- confirm coverage and metric availability

### Phase 2

Build derived aggregation outputs.

Focus:

- monthly summaries
- quarterly summaries
- annual summaries
- documented transformation rules

### Phase 3

Build the application foundation.

Focus:

- frontend scaffold
- supported location selection
- map or spatial selection workflow
- linked filtering
- trend views

### Phase 4

Build suitability support.

Focus:

- explainable rule-based suitability logic
- clear suitability categories
- documented rationale

### Phase 5

Complete delivery quality.

Focus:

- deployment
- testing
- documentation alignment

---

## 10. Acceptance Criteria

### 10.1 Baseline Already Achieved

The following are already considered present in the repo baseline:

- raw BoM source folders are present
- a cleaning script exists
- cleaned daily outputs exist
- station metadata exists
- alias metadata exists
- coverage and issue reports exist
- an internal Codex working note exists in `PROGRESS.md`

### 10.2 Future Deliverable Acceptance

The project will be considered successfully delivered against this scope when all of the following are true:

- supported daily data can be traced to a reproducible pipeline
- monthly, quarterly, and annual summaries are generated from daily cleaned data
- a user can select a supported location in the web application
- the application shows trend views for supported metrics
- the application updates views when the user changes location or timeframe
- the application provides a documented, explainable suitability result
- the application is deployed and usable in a browser
- core functionality is covered by appropriate testing
- delivered work remains within this scope unless the scope file is formally updated

---

## 11. Scope Control Rules

These rules exist to prevent scope creep and keep team work aligned.

### 11.1 Rule For New Work

Before starting a new task, the team should be able to point to at least one of:

- a phase in Section 9
- a requirement ID in Sections 6 or 7
- a known gap in Section 8

If a task cannot be mapped to one of those, it should not start until the scope is updated.

### 11.2 Rule For Progress Updates

Every future progress entry should reference:

- what scope section it advances
- which requirement IDs it supports
- whether it closes a known gap or only improves an existing deliverable

### 11.3 Rule For Out-Of-Scope Requests

If a requested feature falls under Section 5 or materially changes Sections 4, 6, 7, 8, or 9, the team must update `PROJECT_SCOPE.md` before implementation.

### 11.4 Rule For Tradeoffs

If time or data constraints force tradeoffs:

- protect Phase 1 and Phase 2 first
- protect the explainable rule-based suitability version before any advanced model
- protect a working integrated product before optional enhancements

### 11.5 Rule For Claims

The team must not claim:

- full Australia-wide cleaned support
- humidity support
- wind speed support
- live weather capability

unless those capabilities are actually implemented and this file is updated accordingly.

---

## 12. Definition Of Done For Scope Alignment

The project remains aligned to scope when:

- new work clearly maps to this document
- progress updates can be traced back to this document
- unsupported features are not presented as if they already exist
- out-of-scope work does not crowd out agreed deliverables
- the team updates this file when the scope genuinely changes

---

## 13. Short Working Summary

DS-07 currently has a real data-cleaning foundation, but not yet the application, derived aggregations, suitability logic, deployment, or testing layers. The agreed direction is to turn the existing cleaned BoM weather data into an interactive marathon-planning decision-support tool. Future work must stay inside the phase order, requirements, and control rules defined in this file unless the team explicitly revises the scope first.
