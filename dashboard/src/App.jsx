import { useEffect, useMemo, useState } from "react";
import {
  Thermometer,
  ThermometerSun,
  CloudRain,
  Sun,
  Download,
  MapPin,
} from "lucide-react";
import DashboardLayout from "./components/layout/DashboardLayout";
import LeafletMap from "./components/map/LeafletMap";
import MapToolbar from "./components/map/MapToolbar";
import ThresholdPanel from "./components/map/ThresholdPanel";
import ReverseSearchResults from "./components/map/ReverseSearchResults";
import CoverageHints from "./components/map/CoverageHints";
import NearbyStationChips from "./components/map/NearbyStationChips";
import ProbabilityBanner from "./components/suitability/ProbabilityBanner";
import RiskProfile from "./components/suitability/RiskProfile";
import MonthStrip from "./components/suitability/MonthStrip";
import MaxTempChart from "./components/charts/MaxTempChart";
import MinTempChart from "./components/charts/MinTempChart";
import RainfallChart from "./components/charts/RainfallChart";
import UVIndexChart from "./components/charts/UVIndexChart";
import SuitabilityCalendar from "./components/calendar/SuitabilityCalendar";
import StickyComparisonTray from "./components/comparison/StickyComparisonTray";
import ConnectorLine from "./components/common/ConnectorLine";
import StepBadge from "./components/common/StepBadge";
import {
  stations,
  stationsByNumber,
  DEFAULT_STATION_NUMBER,
  DEFAULT_THRESHOLDS,
  MONTHS,
  MONTH_NAMES_LONG,
  computeAdjustedScore,
  getSuitabilityColor,
  getSuitabilityLabel,
  scoreDayAgainstThresholds,
  getSuitabilityKey,
} from "./data/placeholderData";
import {
  useStationDaily,
  summariseMonthly,
  summariseYear,
  averageYearSeries,
} from "./data/useStationDaily";

const ANIMATION_INTERVAL_MS = 1200;

export default function App() {
  const [selectedStationNumber, setSelectedStationNumber] = useState(
    DEFAULT_STATION_NUMBER,
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [thresholds, setThresholds] = useState({ ...DEFAULT_THRESHOLDS });
  const [comparedStations, setComparedStations] = useState([
    DEFAULT_STATION_NUMBER,
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reverseSearchMonth, setReverseSearchMonth] = useState(null);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [granularity, setGranularity] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(2024);

  const selectedStation = useMemo(
    () => stationsByNumber[selectedStationNumber] ?? stations[0],
    [selectedStationNumber],
  );

  const dailyData = useStationDaily(
    selectedStation,
    selectedMonthIndex,
    selectedYear,
  );
  const monthlySummary = useMemo(() => summariseMonthly(dailyData), [dailyData]);

  const yearSeries = useMemo(
    () =>
      granularity === "monthly"
        ? summariseYear(selectedStation, selectedYear)
        : [],
    [granularity, selectedStation, selectedYear],
  );
  const yearAverages = useMemo(
    () => (granularity === "monthly" ? averageYearSeries(yearSeries) : null),
    [granularity, yearSeries],
  );

  const isMonthly = granularity === "monthly";
  // What drives the KPI row + 2×2 charts + transition copy.
  const summary = isMonthly ? yearAverages : monthlySummary;
  const chartData = isMonthly ? yearSeries : dailyData;
  const chartXKey = isMonthly ? "monthLabel" : "day";

  const adjustedScore = useMemo(
    () =>
      computeAdjustedScore(
        selectedStation.monthlyScores[selectedMonthIndex],
        thresholds,
      ),
    [selectedStation, selectedMonthIndex, thresholds],
  );

  const suitabilityKey = getSuitabilityKey(adjustedScore);
  const scoreColor = getSuitabilityColor(adjustedScore);
  const scoreLabel = getSuitabilityLabel(adjustedScore);

  const bestMonthIndex = useMemo(() => {
    let best = 0;
    let bestScore = -1;
    selectedStation.monthlyScores.forEach((s, i) => {
      const adj = computeAdjustedScore(s, thresholds);
      if (adj > bestScore) {
        bestScore = adj;
        best = i;
      }
    });
    return best;
  }, [selectedStation, thresholds]);

  // Daily data shaped for the existing SuitabilityCalendar component.
  const calendarData = useMemo(
    () =>
      dailyData.map((d) => {
        const score = scoreDayAgainstThresholds(d, thresholds);
        return {
          day: d.day,
          score,
          suitability: getSuitabilityKey(score),
        };
      }),
    [dailyData, thresholds],
  );

  // Month-animation loop.
  useEffect(() => {
    if (!isAnimating) return;
    const id = setInterval(() => {
      setSelectedMonthIndex((m) => (m + 1) % 12);
    }, ANIMATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAnimating]);

  const handleSelectStation = (n) => {
    setSelectedStationNumber(n);
    setComparedStations((prev) => {
      if (prev.includes(n)) return prev;
      const next = [n, ...prev].slice(0, 5);
      return next;
    });
  };

  const handleRemoveFromComparison = (n) => {
    setComparedStations((prev) => prev.filter((x) => x !== n));
  };

  const handleToggleAnimate = () => setIsAnimating((v) => !v);

  const handleSelectMonth = (i) => {
    if (isAnimating) setIsAnimating(false);
    setSelectedMonthIndex(i);
  };

  const handleReverseSearch = (m) => {
    setReverseSearchMonth(m);
    if (m != null) {
      setSelectedMonthIndex(m);
      if (isAnimating) setIsAnimating(false);
    }
  };

  const exportSummary = () => {
    const lines = [
      "Marathon Weather Planner — Historical Summary",
      "=============================================",
      `Station: ${selectedStation.name} (#${selectedStation.n}, ${selectedStation.state})`,
      `Month: ${MONTH_NAMES_LONG[selectedMonthIndex]}`,
      `Adjusted suitability score: ${adjustedScore}/100 — ${scoreLabel}`,
      "",
      "Thresholds applied:",
      `  Max temp ≤ ${thresholds.maxTemp}°C`,
      `  Min temp ≥ ${thresholds.minTemp}°C`,
      `  Rainfall ≤ ${thresholds.rainfall}mm`,
      `  UV index ≤ ${thresholds.uv}`,
      "",
      `Avg max temp: ${summary.maxTemp}°C (range ${summary.maxTempMin}–${summary.maxTempMax})`,
      `Avg min temp: ${summary.minTemp}°C (range ${summary.minTempMin}–${summary.minTempMax})`,
      `Avg rainfall: ${summary.rainfall}mm — ${summary.dryDaysPct}% dry days`,
      `Avg UV index: ${summary.uvIndex} — ${summary.uvHighPct}% high+ days`,
      "",
      "Historical analysis only — not a weather forecast.",
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marathon-historical-${selectedStation.n}-${MONTHS[selectedMonthIndex]}-${selectedYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const connectorText = isMonthly
    ? `Historical monthly averages for ${selectedStation.name} — ${selectedYear}`
    : `Historical data for ${selectedStation.name} in ${MONTH_NAMES_LONG[selectedMonthIndex]}`;

  return (
    <DashboardLayout>
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
            Compare historical weather patterns across 180 BoM stations (VIC, NSW, TAS, NT).
          </p>
        </header>

        <LeafletMap
          stations={stations}
          selectedStationNumber={selectedStationNumber}
          monthIndex={selectedMonthIndex}
          thresholds={thresholds}
          onSelectStation={handleSelectStation}
        />

        <div className="mt-3 flex flex-col gap-3">
          <MapToolbar
            isAnimating={isAnimating}
            onToggleAnimate={handleToggleAnimate}
            selectedMonthIndex={selectedMonthIndex}
            reverseSearchMonth={reverseSearchMonth}
            onReverseSearchChange={handleReverseSearch}
            thresholdsOpen={thresholdsOpen}
            onToggleThresholds={() => setThresholdsOpen((v) => !v)}
          />
          {thresholdsOpen && (
            <ThresholdPanel
              thresholds={thresholds}
              onChange={setThresholds}
              selectedStation={selectedStation}
              selectedMonthIndex={selectedMonthIndex}
            />
          )}
          <ReverseSearchResults
            monthIndex={reverseSearchMonth}
            thresholds={thresholds}
            onSelectStation={handleSelectStation}
          />
          <CoverageHints />
          <NearbyStationChips
            selectedStation={selectedStation}
            stations={stations}
            monthIndex={selectedMonthIndex}
            thresholds={thresholds}
            onSelect={handleSelectStation}
          />
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
              Historical weather patterns —{" "}
              <span style={{ color: "var(--primary)" }}>
                {selectedStation.name}
              </span>
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Past observations, not a forecast. Showing{" "}
              {MONTH_NAMES_LONG[selectedMonthIndex]} historical data.
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
            { k: "daily", label: "Daily", enabled: true },
            { k: "monthly", label: "Monthly", enabled: true },
            { k: "quarterly", label: "Quarterly", enabled: false },
            { k: "annually", label: "Annually", enabled: false },
          ].map((g) => (
            <button
              key={g.k}
              type="button"
              onClick={() => g.enabled && setGranularity(g.k)}
              disabled={!g.enabled}
              title={
                g.enabled
                  ? undefined
                  : "Coming soon — needs cleaned multi-year data"
              }
              className="px-2.5 py-1 text-xs font-semibold"
              style={{
                background: granularity === g.k ? "var(--primary-lightest)" : "#fff",
                color: !g.enabled
                  ? "var(--text-muted)"
                  : granularity === g.k
                  ? "var(--primary)"
                  : "var(--text-secondary)",
                border:
                  granularity === g.k
                    ? "1px solid var(--primary-border)"
                    : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: g.enabled ? "pointer" : "not-allowed",
                opacity: g.enabled ? 1 : 0.6,
              }}
              aria-pressed={granularity === g.k}
              aria-disabled={!g.enabled}
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
              {[2020, 2021, 2022, 2023, 2024].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>

        {isMonthly ? (
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
            suitability probability, risk profile, and per-day calendar.
          </div>
        ) : (
          <ProbabilityBanner
            dailyData={dailyData}
            thresholds={thresholds}
            monthIndex={selectedMonthIndex}
          />
        )}

        {/* KPI row */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={ThermometerSun}
            label="Max temp"
            value={`${summary.maxTemp}°C`}
            sub={`range ${summary.maxTempMin}–${summary.maxTempMax}°C`}
            color="#E24B4A"
          />
          <KpiCard
            icon={Thermometer}
            label="Min temp"
            value={`${summary.minTemp}°C`}
            sub={`range ${summary.minTempMin}–${summary.minTempMax}°C`}
            color="#3B8BD4"
          />
          <KpiCard
            icon={CloudRain}
            label="Rainfall"
            value={`${summary.rainfall} mm`}
            sub={`${summary.dryDaysPct}% dry days`}
            color="#1D9E75"
          />
          <KpiCard
            icon={Sun}
            label="UV index"
            value={`${summary.uvIndex}`}
            sub={`${summary.uvHighPct}% high+ days`}
            color="#EF9F27"
          />
        </div>

        {/* Chart grid */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MaxTempChart data={chartData} xKey={chartXKey} />
          <MinTempChart data={chartData} xKey={chartXKey} />
          <RainfallChart data={chartData} xKey={chartXKey} />
          <UVIndexChart data={chartData} xKey={chartXKey} />
        </div>

        {!isMonthly && (
          <div className="mt-4">
            <RiskProfile dailyData={dailyData} thresholds={thresholds} />
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
              Based on these historical patterns, here's the overall suitability
              assessment for <strong>{selectedStation.name}</strong> in{" "}
              <strong>{MONTH_NAMES_LONG[selectedMonthIndex]}</strong>.
            </>
          )}
        </div>
      </section>

      <ConnectorLine text={connectorText} />

      {/* ====== SECTION 3 — SUITABILITY ====== */}
      <section id="suitability" className="section-card" aria-labelledby="suit-title">
        <header className="mb-4">
          <StepBadge variant="suitability">
            Step 3: is it historically suitable?
          </StepBadge>
          <h2
            id="suit-title"
            className="mt-2 text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Historical suitability —{" "}
            <span style={{ color: "var(--primary)" }}>
              {selectedStation.name}, {MONTH_NAMES_LONG[selectedMonthIndex]}
            </span>
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Assessment based on recorded max/min temperature, rainfall, and UV index observations.
          </p>
        </header>

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
              Adjusted score
            </span>
            <div className="my-1 flex items-baseline gap-1">
              <span
                className="text-6xl font-bold tabular-nums"
                style={{ color: scoreColor }}
              >
                {adjustedScore}
              </span>
              <span className="text-lg" style={{ color: "var(--text-muted)" }}>
                /100
              </span>
            </div>
            <span
              className="mb-3 text-sm font-semibold"
              style={{ color: scoreColor }}
            >
              {scoreLabel}
            </span>
            <TrafficLight active={suitabilityKey} />
          </div>

          {/* Risk items */}
          <div className="flex flex-col gap-2">
            <RiskRow
              color="#E24B4A"
              label="Max temp"
              detail={`avg ${summary.maxTemp}°C`}
              assessment={summary.maxTemp > thresholds.maxTemp
                ? "Above your threshold — heat stress risk elevated (Ely et al. marathon pacing literature)."
                : "Within your threshold — acceptable historical range."}
            />
            <RiskRow
              color="#3B8BD4"
              label="Min temp"
              detail={`avg ${summary.minTemp}°C`}
              assessment={summary.minTemp < thresholds.minTemp
                ? "Below your threshold — cold stress possible for waiting runners."
                : "Within your threshold — comfortable for warm-up."}
            />
            <RiskRow
              color="#1D9E75"
              label="Rainfall"
              detail={`avg ${summary.rainfall} mm — ${summary.dryDaysPct}% dry`}
              assessment={summary.rainfall > thresholds.rainfall
                ? "Historically wet — plan for track and spectator conditions."
                : "Low historical rainfall — generally dry."}
            />
            <RiskRow
              color="#EF9F27"
              label="UV index"
              detail={`avg ${summary.uvIndex} — ${summary.uvHighPct}% high+`}
              assessment={summary.uvIndex > thresholds.uv
                ? "High UV exposure (WHO scale) — consider pre-7am starts."
                : "UV within your threshold."}
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
              Historical best window: <strong>{MONTH_NAMES_LONG[bestMonthIndex]}</strong> scores highest for this station under your current thresholds.
            </div>
          </div>
        </div>

        <div className="mt-4">
          <MonthStrip
            station={selectedStation}
            thresholds={thresholds}
            selectedMonthIndex={selectedMonthIndex}
            onSelectMonth={handleSelectMonth}
            onStopAnimation={() => isAnimating && setIsAnimating(false)}
          />
        </div>

        {!isMonthly && (
          <div className="mt-4">
            <div className="mb-2">
              <h4
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Daily historical suitability — {MONTH_NAMES_LONG[selectedMonthIndex]}
              </h4>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Each cell coloured by the day's score against your thresholds.
              </p>
            </div>
            <SuitabilityCalendar
              dailyData={calendarData}
              selectedDay={null}
              onSelectDay={() => {}}
              selectedMonth={selectedMonthIndex + 1}
              selectedYear={selectedYear}
            />
          </div>
        )}

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
          This tool analyses historical BoM observations — it does not predict future weather.
          Suitability scores reflect past patterns using max temp, min temp, rainfall, and UV.
          Humidity and wind are not available. Use alongside official forecasts and local knowledge.
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Compare <strong>{selectedStation.name}</strong> against other stations in the tray below.
          </p>
          <button
            type="button"
            onClick={exportSummary}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: 0,
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export analysis
          </button>
        </div>
      </section>

      <StickyComparisonTray
        comparedStationNumbers={comparedStations}
        primaryStationNumber={selectedStationNumber}
        selectedMonthIndex={selectedMonthIndex}
        thresholds={thresholds}
        onRemove={handleRemoveFromComparison}
        onSelectPrimary={setSelectedStationNumber}
      />
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
    { key: "slightly_suitable", color: "#EFA827", label: "Mixed" },
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
