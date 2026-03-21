import { useState, useMemo } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import DateAnalysisFilters from "./components/layout/DateAnalysisFilters";
import AustraliaMap from "./components/map/AustraliaMap";
import SuitabilityCalendar from "./components/calendar/SuitabilityCalendar";
import TemperatureChart from "./components/charts/TemperatureChart";
import HumidityChart from "./components/charts/HumidityChart";
import WindSpeedChart from "./components/charts/WindSpeedChart";
import UVIndexChart from "./components/charts/UVIndexChart";
import RecommendationPanel from "./components/recommendation/RecommendationPanel";
import LocationComparison from "./components/comparison/LocationComparison";
import Card from "./components/common/Card";
import { locations, getDataForGranularity, suitabilityConfig } from "./data/placeholderData";
import { MapPin, CalendarDays, BarChart3, ShieldCheck, GitCompareArrows } from "lucide-react";

export default function App() {
  const [locationId, setLocationId] = useState("melbourne");
  const [granularity, setGranularity] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [eventType, setEventType] = useState("Marathon");
  const [selectedDay, setSelectedDay] = useState(5);
  const [selectedSuburb, setSelectedSuburb] = useState("Melbourne CBD");

  const location = locations.find((l) => l.id === locationId) || locations[0];

  const chartData = useMemo(
    () => getDataForGranularity(location, granularity, selectedYear, selectedMonth),
    [location, granularity, selectedYear, selectedMonth]
  );

  const xKey = granularity === "daily" ? "day"
    : granularity === "monthly" ? "label"
    : granularity === "quarterly" ? "key"
    : "year";

  const dayData = granularity === "daily"
    ? chartData.find((d) => d.day === selectedDay) || chartData[0]
    : chartData[0];

  const handleLocationChange = (id) => {
    setLocationId(id);
    const loc = locations.find((l) => l.id === id);
    if (loc?.suburbs?.length) setSelectedSuburb(loc.suburbs[0]);
  };

  const handleReset = () => {
    setLocationId("melbourne");
    setGranularity("daily");
    setSelectedMonth(9);
    setSelectedYear(2025);
    setEventType("Marathon");
    setSelectedDay(5);
    setSelectedSuburb("Melbourne CBD");
  };

  const filterProps = {
    locationId,
    onLocationChange: handleLocationChange,
    granularity,
    onGranularityChange: setGranularity,
    selectedMonth,
    onMonthChange: setSelectedMonth,
    selectedYear,
    onYearChange: setSelectedYear,
    eventType,
    onEventTypeChange: setEventType,
  };

  return (
    <DashboardLayout>
      {/* Section 1: Map Explorer */}
      <section id="map-explorer" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]" aria-label="Location explorer and recommendation">
        <Card title="Location Explorer" subtitle="Select a city on the map or from the list below" icon={MapPin}>
          <AustraliaMap
            locationId={locationId}
            onSelectLocation={handleLocationChange}
            selectedSuburb={selectedSuburb}
            onSelectSuburb={setSelectedSuburb}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </Card>
        <Card title="Recommendation" subtitle="Summary for the selected date and location" icon={ShieldCheck}>
          <RecommendationPanel
            location={location}
            selectedSuburb={selectedSuburb}
            dayData={dayData}
            granularity={granularity}
            onReset={handleReset}
          />
        </Card>
      </section>

      {/* Section 2: Date Analysis (filters + calendar + charts) */}
      <section id="date-analysis" className="space-y-6" aria-label="Date analysis">
        <DateAnalysisFilters {...filterProps} />

        {granularity === "daily" ? (
          <Card title="Date Suitability Calendar" subtitle="Colour-coded suitability for each day" icon={CalendarDays}>
            <SuitabilityCalendar
              dailyData={chartData}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </Card>
        ) : (
          <Card title="Period Suitability" subtitle={`${granularity.charAt(0).toUpperCase() + granularity.slice(1)} suitability overview`} icon={CalendarDays}>
            <div className="space-y-2">
              {chartData.map((item, i) => {
                const cfg = suitabilityConfig[item.suitability] || suitabilityConfig.slightly_suitable;
                const periodLabel = item.label || item.key || item.year;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-3">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${cfg.color}`} aria-hidden="true" />
                    <span className="min-w-[60px] text-sm font-semibold text-[var(--text)]">{periodLabel}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-[var(--surface-alt)]">
                        <div className={`h-2 rounded-full ${cfg.color} transition-all`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)]">{item.score}/100</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.chipBg} ${cfg.textColor}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Weather Trends" subtitle="Trend visualisations for key weather attributes" icon={BarChart3}>
          <div className="grid gap-4 md:grid-cols-2">
            <TemperatureChart data={chartData} xKey={xKey} />
            <HumidityChart data={chartData} xKey={xKey} />
            <WindSpeedChart data={chartData} xKey={xKey} />
            <UVIndexChart data={chartData} xKey={xKey} />
          </div>
        </Card>
      </section>

      {/* Section 3: Comparison */}
      <section id="comparison" aria-label="Location comparison">
        <Card title="Location Comparison" subtitle="Compare weather attributes across locations" icon={GitCompareArrows}>
          <LocationComparison
            granularity={granularity}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </Card>
      </section>

      {/* Section 4: Start Planning CTA */}
      <section id="start-planning" aria-label="Start planning">
        <div className="rounded-xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Ready to Plan Your Marathon?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            You have all the tools you need. Pick a location, choose your dates,
            review the weather data, and export your event summary.
          </p>
          <a
            href="#map-explorer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-light)]"
          >
            Begin Planning
          </a>
        </div>
      </section>
    </DashboardLayout>
  );
}
