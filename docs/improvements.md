# Website Improvements — Suitability Review

Source: `Improvements to be made for website.docx` (user-testing feedback, 9 items).
Reviewed against current dashboard code on `main`.

**Key context:** the app currently runs on **synthesized placeholder data** (`useStationDaily` → `synthesiseStationDaily`), not real BoM observations. This shapes what is worth fixing now vs. later.

---

## 1. DO now — high value, low effort, in-scope

| # | Item | Why it fits | Files |
|---|------|-------------|-------|
| 1 | Quarterly/Annually buttons | Already flagged in code (`enabled: false`, "Coming soon" tooltip). Quick polish: ensure disabled cursor + tooltip render correctly. | `dashboard/src/App.jsx:326–363` |
| 6 | Banner vs. calendar contradiction | Real bug — two scoring methods coexist: `ProbabilityBanner` uses strict AND-logic; `SuitabilityCalendar` uses penalty-based 0–100. Add an info icon/tooltip explaining the difference. Pure UX, no data dependency. | `dashboard/src/components/suitability/ProbabilityBanner.jsx`, `dashboard/src/App.jsx` (calendar mapping), `dashboard/src/data/placeholderData.js` (scoring fns) |
| 7 | Export button has no feedback | `exportSummary()` triggers a silent download — no loading state, no toast, no confirmation. Add a loading state on the button + a toast. | `dashboard/src/App.jsx:174–204, 664–679` |
| 9 | Historical disclaimer prominence | Text exists in 3 places (HeaderBar 10px, two App.jsx captions) but never near the suitability score. Move/duplicate it directly under `ProbabilityBanner`. Trivial, high-trust payoff. | `dashboard/src/components/layout/HeaderBar.jsx`, `dashboard/src/App.jsx:293, 655` |

## 2. DO if mobile is in scope

| # | Item | Why | Files |
|---|------|-----|-------|
| 8 | Mobile map zoom controls | No responsive CSS exists for `.leaflet-control`. Real gap. Easy CSS-only fix (`@media` + larger tap targets). Worth doing if FYP demo includes mobile. | `dashboard/src/components/map/LeafletMap.jsx`, global CSS |

## 3. PARTIAL — reframe before doing

| # | Item | Reframe | Files |
|---|------|---------|-------|
| 4 | "Persistent summary bar" | HeaderBar exists with nav pills — but it does **not** show selected **location + timeframe + current score**. User feedback is valid. Extend HeaderBar (or add a sticky strip below it) to show current selection state, instead of building a new component. | `dashboard/src/components/layout/HeaderBar.jsx`, `dashboard/src/components/layout/DashboardLayout.jsx` |

## 4. SKIP / DEFER

| # | Item | Reason | Files |
|---|------|--------|-------|
| 2 | Y-axis inverted, rainfall lacks labels | Code review shows axis is **not** reversed and rainfall has `tickFormatter` ticks. Tester likely saw an older build, or odd synthetic values made it *look* off. Verify visually in `npm run dev` first; only fix if reproducible. | `dashboard/src/components/charts/TrendChartWrapper.jsx`, `RainfallChart.jsx` |
| 3 | Map blank loading state | Map renders cold but background is `#F0F0E8` (light beige), not white; tile load is fast on Leaflet's default CDN. Low impact. Add only if slow-network demo issues appear. | `dashboard/src/components/map/LeafletMap.jsx` |
| 5 | Onboarding walkthrough + slider tooltips | Heaviest lift on the list — needs tooltip library or custom popover system, plus walkthrough state machine. Out of scope for "polish" tier. Add tooltips to `SliderRow` if anything; full onboarding deferred. | `dashboard/src/components/common/SliderRow.jsx`, `ThresholdPanel.jsx` |

---

## Suggested fix order (rough effort)

1. **#9** disclaimer placement — ~5 min
2. **#1** disable styling polish — ~15 min
3. **#7** export button feedback — ~30 min (toast + loading state)
4. **#6** scoring explainer tooltip — ~30 min
5. **#4** sticky selection bar — 1–2 hr (real component work)
6. **#8** mobile map controls — ~30 min CSS (if mobile in scope)
7. **#2, #3** verify-then-decide — ~15 min check
8. **#5** defer

---

## Original feedback (verbatim, condensed)

1. **Quarterly/Annually buttons look active but do nothing** — grey out + "Coming soon" tooltip, or hide.
2. **Charts** — temperature Y-axis appears inverted; rainfall shows "mm" without numeric values. Fix axis direction; add numeric ticks (2 mm, 4 mm, 6 mm).
3. **Map** — sometimes loads as blank white box. Add loading spinner / skeleton / error retry.
4. **Workflow** — Where/When/Plan feels disjointed. Persistent summary bar (location + timeframe + suitability); transition headings.
5. **First-time users** — threshold sliders need trial and error. 3–4 step onboarding walkthrough; tooltips; skippable.
6. **Scoring** — banner says "0 suitable days" while calendar shows green cells. Explain the two methods inline; tooltips on terms.
7. **Export Analysis** — no feedback. "Exporting…" loading state; success/error toast; download confirmation.
8. **Mobile** — map zoom buttons too small. Larger tap targets; test on small screens.
9. **Disclaimer** — historical-data note not prominent enough. Place beneath suitability score: "Based on historical observations only, not a forecast."
