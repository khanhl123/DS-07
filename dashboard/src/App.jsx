import { useEffect, useMemo, useState } from "react";
import {
  Thermometer,
  ThermometerSun,
  CloudRain,
  Sun,
  Download,
  MapPin,
  Target,
} from "lucide-react";
import DashboardLayout from "./components/layout/DashboardLayout";
import HeroSection from "./components/layout/HeroSection";
import LeafletMap from "./components/map/LeafletMap";
import CoverageHints from "./components/map/CoverageHints";
import RiskProfile from "./components/suitability/RiskProfile";
import MonthStrip from "./components/suitability/MonthStrip";
import MaxTempChart from "./components/charts/MaxTempChart";
import MinTempChart from "./components/charts/MinTempChart";
import RainfallChart from "./components/charts/RainfallChart";
import UVIndexChart from "./components/charts/UVIndexChart";
import SuitabilityCalendar from "./components/calendar/SuitabilityCalendar";
import ThresholdPanel from "./components/suitability/ThresholdPanel";
import ConnectorLine from "./components/common/ConnectorLine";
import StepBadge from "./components/common/StepBadge";
import {
  stations,
  stationsByNumber,
  coveredStateCodes,
  DEFAULT_STATION_NUMBER,
  MONTHS,
  MONTH_NAMES_LONG,
  getSuitabilityColor,
  getSuitabilityLabel,
  getSuitabilityKey,
  SCORE_NA_TEXT,
} from "./data/placeholderData";
import {
  useStationDaily,
  useStationPredicted,
  useStationYearly,
  useStationYears,
  summariseMonthly,
  averageYearSeries,
} from "./data/useStationDaily";

const fmt = (v, unit = "") => (v == null ? "—" : `${v}${unit}`);
const fmtRange = (lo, hi, unit = "") =>
  lo == null || hi == null ? "—" : `${lo}–${hi}${unit}`;

export default function App() {
  const [selectedStationNumber, setSelectedStationNumber] = useState(
    DEFAULT_STATION_NUMBER,
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [granularity, setGranularity] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [exportStatus, setExportStatus] = useState("idle");
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [suitabilityRevealed, setSuitabilityRevealed] = useState(false);

  const selectedStation = useMemo(
    () => stationsByNumber[selectedStationNumber] ?? stations[0],
    [selectedStationNumber],
  );

  // Reset on data-source change so a prior prediction can't leak across
  // selections.
  const [predictRequested, setPredictRequested] = useState(false);
  useEffect(() => {
    setPredictRequested(false);
  }, [selectedStationNumber, selectedMonthIndex, selectedYear, granularity]);

  const historical = useStationDaily(
    selectedStation,
    selectedMonthIndex,
    selectedYear,
    !predictRequested,
  );
  const predicted = useStationPredicted(
    selectedStation,
    selectedMonthIndex,
    selectedYear,
    predictRequested,
  );
  const {
    data: dailyData,
    loading: dailyLoading,
    error: dailyError,
  } = predictRequested ? predicted : historical;
  const monthlySummary = useMemo(() => summariseMonthly(dailyData), [dailyData]);

  // Always fetch yearly so the Section 3 score card can show the year-specific
  // expert verdict (yearSeries[monthIndex].marathonVerdict) regardless of the
  // daily/monthly toggle. Same endpoint also powers the monthly KPI averages.
  const {
    data: yearSeries,
    loading: yearlyLoading,
    error: yearlyError,
  } = useStationYearly(selectedStation, selectedYear, true);
  const yearAverages = useMemo(
    () => (granularity === "monthly" ? averageYearSeries(yearSeries) : null),
    [granularity, yearSeries],
  );

  const { data: availableYears } = useStationYears(selectedStation);
  // Make sure the current selectedYear remains valid for this station.
  useEffect(() => {
    if (!availableYears?.length) return;
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const isLoading = granularity === "monthly" ? yearlyLoading : dailyLoading;
  const loadError = granularity === "monthly" ? yearlyError : dailyError;
  const hasNoData =
    !isLoading &&
    !loadError &&
    (granularity === "monthly" ? yearSeries.length === 0 : dailyData.length === 0);

  const isMonthly = granularity === "monthly";
  // What drives the KPI row + 2×2 charts + transition copy.
  const summary = isMonthly ? yearAverages : monthlySummary;
  const chartData = isMonthly ? yearSeries : dailyData;
  const chartXKey = isMonthly ? "monthLabel" : "day";

  // Year-specific expert score for the selected month. Falls back to the
  // climatology baked into stations.js while the yearly fetch is in flight,
  // so the score card doesn't pop from "—" to a number on every selection.
  const yearMonth = useMemo(
    () => yearSeries?.find?.((m) => m.month === selectedMonthIndex) ?? null,
    [yearSeries, selectedMonthIndex],
  );
  const expertScore =
    yearMonth?.marathonVerdict?.score ??
    selectedStation.monthlyScores[selectedMonthIndex];
  const expertConfidence =
    yearMonth?.marathonVerdict?.confidence ??
    selectedStation.monthlyConfidence?.[selectedMonthIndex] ??
    null;

  const suitabilityKey = getSuitabilityKey(expertScore);
  const scoreColor = getSuitabilityColor(expertScore);
  const scoreLabel = getSuitabilityLabel(expertScore);

  // Returns null when every month is unscorable (all-null monthlyScores)
  // so the UI can say "insufficient data" instead of falsely labelling
  // January (index 0) as the best window.
  const bestMonthIndex = useMemo(() => {
    let best = null;
    let bestScore = -1;
    selectedStation.monthlyScores.forEach((s, i) => {
      if (s != null && s > bestScore) {
        bestScore = s;
        best = i;
      }
    });
    return best;
  }, [selectedStation]);

  // Daily data shaped for the existing SuitabilityCalendar component.
  // Per-day score comes straight from the expert model verdict computed by
  // the API. Days without a verdict (sparse rows / missing inputs) are passed
  // through with score=null so the calendar can render them as "no data"
  // rather than mis-coloured red.
  const calendarData = useMemo(
    () =>
      dailyData.map((d) => {
        const score = d.marathonVerdict?.score ?? null;
        return {
          day: d.day,
          score,
          suitability: score == null ? null : getSuitabilityKey(score),
          marathonVerdict: d.marathonVerdict ?? null,
        };
      }),
    [dailyData],
  );

  const handleSelectStation = (n) => {
    setSelectedStationNumber(n);
    setHasUserSelected(true);
  };

  const handleSelectMonth = (i) => {
    setSelectedMonthIndex(i);
  };

  const exportSummary = async () => {
    setExportStatus("exporting");
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    try {
      const lines = [
        predictRequested
          ? "Marathon Weather Planner — NN-Predicted Summary"
          : "Marathon Weather Planner — Historical Summary",
        "=============================================",
        `Station: ${selectedStation.name} (#${selectedStation.n}, ${selectedStation.state})`,
        `Month: ${MONTH_NAMES_LONG[selectedMonthIndex]}`,
        `Year: ${selectedYear}`,
        expertScore == null
          ? `Expert suitability score: ${SCORE_NA_TEXT.toLowerCase()}`
          : `Expert suitability score: ${expertScore}/100 — ${scoreLabel}`,
        "",
        `Avg max temp: ${fmt(summary.maxTemp, "°C")} (range ${fmtRange(summary.maxTempMin, summary.maxTempMax, "°C")})`,
        `Avg min temp: ${fmt(summary.minTemp, "°C")} (range ${fmtRange(summary.minTempMin, summary.minTempMax, "°C")})`,
        `Avg rainfall: ${fmt(summary.rainfall, "mm")} — ${fmt(summary.dryDaysPct, "%")} dry days`,
        `Avg UV index: ${fmt(summary.uvIndex)} — ${fmt(summary.uvHighPct, "%")} high+ days`,
        "",
        predictRequested
          ? "NN-predicted weather — not a recorded observation."
          : "Historical analysis only — not a weather forecast.",
      ];
      const blob = new Blob([lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marathon-${predictRequested ? "predicted" : "historical"}-${selectedStation.n}-${MONTHS[selectedMonthIndex]}-${selectedYear}.txt`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportStatus("success");
    } catch {
      setExportStatus("error");
    } finally {
      window.setTimeout(() => setExportStatus("idle"), 2800);
    }
  };

  const connectorText = isMonthly
    ? `Historical monthly averages for ${selectedStation.name} — ${selectedYear}`
    : `Historical data for ${selectedStation.name} in ${MONTH_NAMES_LONG[selectedMonthIndex]}`;
  const timeframeLabel = isMonthly
    ? `${selectedYear} monthly view`
    : `${MONTH_NAMES_LONG[selectedMonthIndex]} ${selectedYear}`;

  const scrollToSection = (id) => {
    let el = document.getElementById(id);
    if (!el && id === "suitability") el = document.getElementById("suitability-cta");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout
      summary={{
        hasSelection: hasUserSelected,
        stationName: selectedStation.name,
        stationNumber: selectedStation.n,
        stationState: selectedStation.state,
        timeframe: timeframeLabel,
        score: expertScore,
        scoreLabel,
        scoreColor,
      }}
      hero={
        <HeroSection
          onStart={() => scrollToSection("where")}
          onJumpTo={scrollToSection}
        />
      }
    >
      {/* ====== SECTION 1 — WHERE ====== */}
      <section id="where" className="section-card" aria-labelledby="where-title">
        <header className="mb-4">
          <StepBadge variant="where">Step 1: where</StepBadge>
          <h2
            id="where-title"
            className="mt-2 text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Where could you host your marathon?
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Compare historical weather patterns across {stations.length} BoM stations ({coveredStateCodes.join(", ")}).
          </p>
        </header>

        <LeafletMap
          stations={stations}
          selectedStationNumber={selectedStationNumber}
          monthIndex={selectedMonthIndex}
          year={selectedYear}
          onSelectStation={handleSelectStation}
        />

        <div className="mt-3">
          <CoverageHints />
        </div>
      </section>

      <ConnectorLine text={connectorText} />

      {/* ====== SECTION 2 — WHEN ====== */}
      <section id="when" className="section-card" aria-labelledby="when-title">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <StepBadge variant="when">Step 2: when</StepBadge>
            <h2
              id="when-title"
              className="mt-2 text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {predictRequested ? "NN-predicted weather" : "Historical weather patterns"} —{" "}
              <span style={{ color: "var(--primary)" }}>
                {selectedStation.name}
              </span>
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {predictRequested
                ? `NN-predicted daily weather for ${MONTH_NAMES_LONG[selectedMonthIndex]}; extrapolated from historical training data.`
                : `Past observations, not a forecast. Showing ${MONTH_NAMES_LONG[selectedMonthIndex]} historical data.`}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-secondary)",
            }}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Station #{selectedStation.n} · {selectedStation.state}
          </span>
        </header>

        {/* Filter row */}
        <div
          className="mb-4 flex flex-wrap items-center gap-2 p-3"
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius)",
          }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            Granularity
          </div>
          {[
            { k: "daily", label: "Daily" },
            { k: "monthly", label: "Monthly" },
          ].map((g) => (
            <button
              key={g.k}
              type="button"
              onClick={() => setGranularity(g.k)}
              className="px-2.5 py-1 text-xs font-semibold transition"
              style={{
                background:
                  granularity === g.k ? "var(--primary-lightest)" : "#fff",
                color:
                  granularity === g.k
                    ? "var(--primary)"
                    : "var(--text-secondary)",
                border:
                  granularity === g.k
                    ? "1px solid var(--primary-border)"
                    : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
              aria-pressed={granularity === g.k}
            >
              {g.label}
            </button>
          ))}
          <div
            className="mx-2 h-5 w-px"
            style={{ background: "var(--border)" }}
          />
          <label
            className="inline-flex items-center gap-2 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Month
            <select
              value={selectedMonthIndex}
              onChange={(e) => handleSelectMonth(Number(e.target.value))}
              style={{
                padding: "3px 6px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "#fff",
                fontSize: 12,
              }}
            >
              {MONTH_NAMES_LONG.map((n, i) => (
                <option key={n} value={i}>{n}</option>
              ))}
            </select>
          </label>
          <label
            className="inline-flex items-center gap-2 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Year
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: "3px 6px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "#fff",
                fontSize: 12,
              }}
            >
              {(availableYears?.length ? availableYears : [selectedYear]).map(
                (y) => (
                  <option key={y} value={y}>{y}</option>
                ),
              )}
            </select>
          </label>
        </div>

        {isMonthly && (
          <div
            className="p-3 text-xs"
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-secondary)",
            }}
          >
            Monthly view — switch back to <strong>Daily</strong> for the
            risk profile and per-day calendar.
          </div>
        )}

        <DataStatusBanner
          loading={isLoading}
          error={loadError}
          empty={hasNoData}
          timeframe={timeframeLabel}
          stationName={selectedStation.name}
          canPredict={granularity === "daily" && !predictRequested}
          onPredict={() => setPredictRequested(true)}
        />

        {/* KPI row */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={ThermometerSun}
            label="Max temp"
            value={fmt(summary.maxTemp, "°C")}
            sub={`range ${fmtRange(summary.maxTempMin, summary.maxTempMax, "°C")}`}
            color="#E24B4A"
          />
          <KpiCard
            icon={Thermometer}
            label="Min temp"
            value={fmt(summary.minTemp, "°C")}
            sub={`range ${fmtRange(summary.minTempMin, summary.minTempMax, "°C")}`}
            color="#3B8BD4"
          />
          <KpiCard
            icon={CloudRain}
            label="Rainfall"
            value={fmt(summary.rainfall, " mm")}
            sub={`${fmt(summary.dryDaysPct, "%")} dry days`}
            color="#1D9E75"
          />
          <KpiCard
            icon={Sun}
            label="UV index*"
            value={fmt(summary.uvIndex)}
            sub={`${fmt(summary.uvHighPct, "%")} high+ days`}
            color="#EF9F27"
          />
        </div>

        {/* Chart grid */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MaxTempChart data={chartData} xKey={chartXKey} isPredicted={predictRequested} />
          <MinTempChart data={chartData} xKey={chartXKey} isPredicted={predictRequested} />
          <RainfallChart data={chartData} xKey={chartXKey} isPredicted={predictRequested} />
          <UVIndexChart data={chartData} xKey={chartXKey} />
        </div>

        {!isMonthly && (
          <div className="mt-4">
            <RiskProfile dailyData={dailyData} />
          </div>
        )}

        <div
          className="mt-4 p-3 text-xs"
          style={{
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text-secondary)",
          }}
        >
          {isMonthly ? (
            <>
              Monthly averages for <strong>{selectedStation.name}</strong> across{" "}
              <strong>{selectedYear}</strong>. Switch to Daily to explore a single
              month's suitability.
            </>
          ) : (
            <>
              Based on these {predictRequested ? "predicted" : "historical"} patterns, here's the overall suitability
              assessment for <strong>{selectedStation.name}</strong> in{" "}
              <strong>{MONTH_NAMES_LONG[selectedMonthIndex]}</strong>.
            </>
          )}
        </div>
      </section>

      {suitabilityRevealed ? (
        <>
      <ConnectorLine text={connectorText} />

      {/* ====== SECTION 3 — SUITABILITY ====== */}
      <section id="suitability" className="section-card" aria-labelledby="suit-title">
        <header className="mb-4">
          <StepBadge variant="suitability">
            Step 3: {predictRequested ? "will conditions be suitable?" : "is it historically suitable?"}
          </StepBadge>
          <h2
            id="suit-title"
            className="mt-2 text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {predictRequested ? "Predicted suitability" : "Historical suitability"} —{" "}
            <span style={{ color: "var(--primary)" }}>
              {selectedStation.name}, {MONTH_NAMES_LONG[selectedMonthIndex]} {selectedYear}
            </span>
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {predictRequested
              ? "Assessment based on NN-predicted max/min temperature, rainfall, and UV index."
              : "Assessment based on recorded max/min temperature, rainfall, and UV index observations."}
          </p>
        </header>

        <ThresholdPanel
          dailyData={dailyData}
          stationName={selectedStation.name}
          monthLabel={MONTH_NAMES_LONG[selectedMonthIndex]}
        />

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Score card */}
          <div
            className="flex flex-col items-center justify-center p-6"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
            }}
          >
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Expert score · {MONTHS[selectedMonthIndex]} {selectedYear}
            </span>
            <div className="my-1 flex items-baseline gap-1">
              <span
                className="text-6xl font-bold tabular-nums"
                style={{ color: scoreColor }}
              >
                {expertScore ?? "—"}
              </span>
              <span className="text-lg" style={{ color: "var(--text-muted)" }}>
                /100
              </span>
            </div>
            <span
              className="mb-3 text-sm font-semibold text-center"
              style={{ color: scoreColor }}
            >
              {expertScore == null ? SCORE_NA_TEXT : scoreLabel}
            </span>
            {expertScore != null && <TrafficLight active={suitabilityKey} />}
            {expertScore != null && expertConfidence === "partial" && (
              <span
                className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: "var(--surface-alt)",
                  color: "var(--text-secondary)",
                  border: "1px dashed var(--border)",
                }}
                title="Score computed from a subset of weather attributes (the model renormalised over what's available)"
              >
                Partial data
              </span>
            )}
            <p
              className="mt-3 max-w-[210px] text-center text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {expertScore == null
                ? "At least one of max temp, min temp, UV, or rainfall is missing for this month."
                : expertConfidence === "partial"
                ? "Some attributes were unavailable for this month; the model renormalised over the rest. Treat as indicative."
                : predictRequested
                ? "Based on NN-predicted weather; uncertainty is higher than historical estimates."
                : "Based on historical observations only, not a forecast."}
            </p>
          </div>

          {/* Risk items */}
          <div className="flex flex-col gap-2">
            <RiskRow
              color="#E24B4A"
              label="Max temp"
              detail={`avg ${fmt(summary.maxTemp, "°C")}`}
              assessment={assessMaxTemp(summary.maxTemp)}
            />
            <RiskRow
              color="#3B8BD4"
              label="Min temp"
              detail={`avg ${fmt(summary.minTemp, "°C")}`}
              assessment={assessMinTemp(summary.minTemp)}
            />
            <RiskRow
              color="#1D9E75"
              label="Rainfall"
              detail={`avg ${fmt(summary.rainfall, " mm")} — ${fmt(summary.dryDaysPct, "%")} dry`}
              assessment={assessRainfall(summary.rainfall)}
            />
            <RiskRow
              color="#EF9F27"
              label="UV index"
              detail={`avg ${fmt(summary.uvIndex)} — ${fmt(summary.uvHighPct, "%")} high+`}
              assessment={assessUv(summary.uvIndex)}
            />
            <div
              className="mt-2 p-3 text-xs"
              style={{
                background: "var(--primary-lightest)",
                border: "1px solid var(--primary-border)",
                borderRadius: "var(--radius)",
                color: "#0a5a46",
              }}
            >
              {bestMonthIndex == null
                ? "Insufficient data to identify a best window for this station."
                : (
                  <>
                    Historical best window: <strong>{MONTH_NAMES_LONG[bestMonthIndex]}</strong> scores highest for this station under the marathon-running expert model.
                  </>
                )}
            </div>
          </div>
        </div>

        {!isMonthly && (
          <div className="mt-4">
            <div className="mb-2">
              <h4
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Daily {predictRequested ? "predicted" : "historical"} suitability — {MONTH_NAMES_LONG[selectedMonthIndex]}
              </h4>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Each cell coloured by the marathon-running expert model's verdict for that day.
              </p>
            </div>
            <SuitabilityCalendar
              dailyData={calendarData}
              selectedDay={null}
              onSelectDay={() => {}}
              selectedMonth={selectedMonthIndex + 1}
              selectedYear={selectedYear}
              isPredicted={predictRequested}
            />
          </div>
        )}

        <div className="mt-4">
          <MonthStrip
            station={selectedStation}
            selectedMonthIndex={selectedMonthIndex}
            onSelectMonth={handleSelectMonth}
          />
        </div>

        <div
          className="mt-4 p-3"
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            fontSize: "9px",
            lineHeight: 1.5,
            color: "var(--text-muted)",
          }}
        >
          {predictRequested
            ? "Currently showing NN-predicted weather, extrapolated from historical BoM training data — not real observations. Suitability scores reflect predicted conditions using max temp, min temp, rainfall, and UV. Humidity and wind are not predicted. UV index is estimated from predicted solar exposure (MJ/m²) using a linear conversion. Treat predictions as indicative; uncertainty grows with distance from observed years. Use alongside official forecasts and local knowledge."
            : "This tool analyses historical BoM observations — it does not predict future weather. Suitability scores reflect past patterns using max temp, min temp, rainfall, and UV. Humidity and wind are not available. UV index is estimated from BoM daily solar exposure (MJ/m²) using a linear conversion; treat it as an indicative peak, not an official UV measurement. Use alongside official forecasts and local knowledge."}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={exportSummary}
            disabled={exportStatus === "exporting"}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: 0,
              borderRadius: "var(--radius)",
              cursor: exportStatus === "exporting" ? "progress" : "pointer",
              opacity: exportStatus === "exporting" ? 0.75 : 1,
            }}
          >
            <Download className="h-3.5 w-3.5" />
            {exportStatus === "exporting" ? "Exporting..." : "Export analysis"}
          </button>
          {exportStatus !== "idle" && exportStatus !== "exporting" && (
            <span
              role="status"
              className="text-xs font-semibold"
              style={{
                color:
                  exportStatus === "success"
                    ? "var(--primary)"
                    : "var(--color-unsuitable)",
              }}
            >
              {exportStatus === "success"
                ? "Download started."
                : "Export failed. Please try again."}
            </span>
          )}
        </div>
      </section>
        </>
      ) : (
        <div id="suitability-cta" className="my-6 flex justify-center">
          <button
            type="button"
            onClick={() => setSuitabilityRevealed(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: 0,
              borderRadius: "var(--radius)",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Target className="h-4 w-4" />
            Calculate Me
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  const IconComponent = icon;
  return (
    <div
      className="flex items-start gap-3 p-4"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
      }}
    >
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center"
        style={{
          background: "#fff",
          borderRadius: "var(--radius-sm)",
          color,
        }}
      >
        <IconComponent className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </div>
        <div
          className="text-lg font-bold tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function TrafficLight({ active }) {
  const items = [
    { key: "suitable", color: "#59C459", label: "Suitable" },
    { key: "mixed", color: "#EFA827", label: "Mixed" },
    { key: "not_suitable", color: "#E24B4A", label: "Unsuitable" },
  ];
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Suitability indicator">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-1">
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: active === it.key ? it.color : "#D8D5CB",
              boxShadow: active === it.key ? `0 0 0 2px ${it.color}33` : "none",
            }}
          />
          <span
            className="text-[10px]"
            style={{
              color: active === it.key ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: active === it.key ? 700 : 500,
            }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RiskRow({ color, label, detail, assessment }) {
  return (
    <div
      className="flex items-start gap-3 p-3"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <span
        aria-hidden="true"
        className="mt-1 shrink-0"
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
        }}
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {label}
          </span>
          <span
            className="text-[11px] tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            {detail}
          </span>
        </div>
        <p
          className="mt-0.5 text-[11px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {assessment}
        </p>
      </div>
    </div>
  );
}

// Research-backed risk copy. Bands mirror the knee points of the expert model
// (models/suitability_score_model.py) so the assessment text agrees with what
// the score itself reacts to.
function assessMaxTemp(t) {
  if (t == null) return "No data.";
  if (t < 8) return "Cool side of optimal — light layers needed at the start.";
  if (t < 12) return "Optimal window — fast-marathon climate (London/Berlin record range).";
  if (t < 15) return "Mild — slight performance decline begins above ~13°C (Ely et al.).";
  if (t < 18) return "Warm — WMA yellow-flag zone; hydration plan matters.";
  if (t < 22) return "Hot — WMA red-flag zone; pace reduction expected, heat illness risk rising.";
  if (t < 25) return "Very hot — serious heat-stress risk for recreational runners.";
  return "Dangerous heat — WMA black-flag territory; race cancellation likely.";
}

function assessMinTemp(t) {
  if (t == null) return "No data.";
  if (t < 0) return "Sub-zero start — ice and hypothermia risk at the gun.";
  if (t < 5) return "Cold start — full layering required; pavement may be icy.";
  if (t < 10) return "Cool start — comfortable with light gear, body warms naturally.";
  if (t < 15) return "Optimal start temperature — comfortable through early kilometres.";
  if (t < 18) return "Warm start — hydration strategy needed from km 1.";
  if (t < 22) return "Hot start — body under heat stress before the gun (Roberts, 2010).";
  return "Very hot overnight — race-day heat will compound rapidly.";
}

function assessRainfall(r) {
  if (r == null) return "No data.";
  if (r < 1) return "Dry — optimal grip and thermoregulation.";
  if (r < 2.5) return "Light rain — mild evaporative cooling benefit in warm conditions (Vihma, 2010).";
  if (r < 5) return "Moderate rain — wet shoes, slight grip reduction.";
  if (r < 10) return "Heavy-ish rain — meaningful grip and blister risk.";
  if (r < 20) return "Heavy rain — hypothermia risk for slower finishers; amber-warning territory.";
  return "Extreme rainfall — dangerous; race organisers would typically issue safety warnings.";
}

function assessUv(u) {
  if (u == null) return "No data.";
  if (u <= 2) return "Low UV (WHO scale) — negligible radiant heat load.";
  if (u <= 5) return "Moderate UV — manageable with sunscreen and a cap.";
  if (u <= 7) return "High UV — noticeable radiant heat over 4+ hours; sun protection mandatory.";
  if (u <= 10) return "Very high UV — WHO advises avoiding prolonged outdoor activity.";
  return "Extreme UV — WHO advises staying indoors during peak hours.";
}

function DataStatusBanner({
  loading, error, empty, timeframe, stationName,
  canPredict = false, onPredict,
}) {
  if (!loading && !error && !empty) return null;
  let bg = "var(--surface)";
  let border = "1px solid var(--border)";
  let color = "var(--text-secondary)";
  let text = "";
  if (error) {
    bg = "#FADBDB";
    border = "1px solid #E9A7A6";
    color = "#8a2a29";
    text = `Couldn't load data for ${stationName} (${timeframe}). The weather service is unreachable — please try again shortly.`;
  } else if (loading) {
    text = `Loading ${stationName} — ${timeframe}…`;
  } else if (empty) {
    bg = "#FBEFCC";
    border = "1px solid #E9CD84";
    color = "#7a5a0a";
    text = `No observations recorded for ${stationName} in ${timeframe}.`;
  }
  const showPredictButton = empty && canPredict && !loading && !error;
  return (
    <div
      role={error ? "alert" : "status"}
      className="mt-3 p-3 text-xs"
      style={{
        background: bg,
        border,
        borderRadius: "var(--radius)",
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span>{text}</span>
      {showPredictButton && (
        <button
          type="button"
          onClick={onPredict}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Predict with NN model
        </button>
      )}
    </div>
  );
}
