import { useState, useMemo } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
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
    <DashboardLayout filterProps={filterProps}>
      {/* Row 1: Map + Recommendation */}
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

      {/* Row 2: Date Suitability */}
      <section id="date-analysis" aria-label="Date suitability">
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
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.chipBg} ${cfg.textColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Row 3: Weather Trend Charts */}
      <section aria-label="Weather trends">
        <Card title="Weather Trends" subtitle="Trend visualisations for key weather attributes" icon={BarChart3}>
          <div className="grid gap-4 md:grid-cols-2">
            <TemperatureChart data={chartData} xKey={xKey} />
            <HumidityChart data={chartData} xKey={xKey} />
            <WindSpeedChart data={chartData} xKey={xKey} />
            <UVIndexChart data={chartData} xKey={xKey} />
          </div>
        </Card>
      </section>

      {/* Row 4: Location Comparison */}
      <section id="comparison" aria-label="Location comparison">
        <Card title="Location Comparison" subtitle="Compare weather attributes across locations" icon={GitCompareArrows}>
          <LocationComparison
            granularity={granularity}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </Card>
      </section>
      {/* Row 5: Methodology */}
      <section id="methodology" aria-label="Methodology">
        <Card title="Methodology" subtitle="How the suitability score is calculated" icon={ShieldCheck}>
          <div className="max-w-3xl space-y-4">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              The marathon suitability score is a weighted composite index calculated from four key weather attributes that directly affect runner safety and event quality.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">🌡️ Temperature</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Optimal range: 10–20°C. Scores decrease sharply above 25°C due to heat stress risk.</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">💧 Humidity</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Penalised above 60%. High humidity impairs thermoregulation and increases physiological strain.</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">💨 Wind Speed</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Moderate wind is acceptable, but speeds above 15 km/h reduce scores. Above 30 km/h is flagged as high risk.</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">☀️ UV Index</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Scores above 6 are penalised. Extreme UV (8+) significantly reduces suitability for outdoor endurance events.</p>
              </div>
            </div>
            <div className="rounded-lg border border-l-4 border-[var(--border)] border-l-[var(--accent-blue)] bg-blue-50 p-4">
              <p className="text-sm font-semibold text-[var(--primary)]">Suitability Categories</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Scores of 70+ are rated <strong className="text-green-700">Suitable</strong> (green), 
                45–69 are <strong className="text-amber-700">Slightly Suitable</strong> (yellow), 
                and below 45 are <strong className="text-red-700">Not Suitable</strong> (red). 
                The final score is clamped between 0 and 100.
              </p>
            </div>
          </div>
        </Card>
      </section>

    </DashboardLayout>
  );
}

