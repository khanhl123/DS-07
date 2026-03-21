import { useEffect, useMemo, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChartLabel, setActiveChartLabel] = useState(null);

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

  useEffect(() => {
    setActiveChartLabel(null);
  }, [locationId, granularity, selectedMonth, selectedYear]);

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
    setActiveChartLabel(null);
  };

  const handleChartPointSelect = (point) => {
    if (granularity === "daily" && typeof point?.day === "number") {
      setSelectedDay(point.day);
    }
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

  const chartSharedProps = {
    xKey,
    granularity,
    activeLabel: activeChartLabel,
    onActiveLabelChange: setActiveChartLabel,
    onPointSelect: handleChartPointSelect,
  };

  return (
    <DashboardLayout filterProps={filterProps} sidebarOpen={sidebarOpen} onToggleSidebar={setSidebarOpen}>
      <section className="grid gap-6 xl:grid-cols-2" aria-label="Location and suitability">
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
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${cfg.color}`} aria-hidden="true" />
                    <span className="min-w-[60px] text-sm font-semibold text-slate-700">{periodLabel}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${cfg.color} transition-all`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{item.score}/100</span>
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

      <section aria-label="Weather trends">
        <Card title="Weather Trends" subtitle="Trend visualisations for key weather attributes" icon={BarChart3}>
          <div className="grid gap-4 md:grid-cols-2">
            <TemperatureChart data={chartData} {...chartSharedProps} />
            <HumidityChart data={chartData} {...chartSharedProps} />
            <WindSpeedChart data={chartData} {...chartSharedProps} />
            <UVIndexChart data={chartData} {...chartSharedProps} />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.5fr]" aria-label="Recommendations and comparison">
        <Card title="Recommendation" subtitle="Summary for the selected date and location" icon={ShieldCheck}>
          <RecommendationPanel
            location={location}
            selectedSuburb={selectedSuburb}
            dayData={dayData}
            granularity={granularity}
            onReset={handleReset}
          />
        </Card>

        <Card title="Location Comparison" subtitle="Compare weather attributes across locations" icon={GitCompareArrows}>
          <LocationComparison
            granularity={granularity}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </Card>
      </section>
    </DashboardLayout>
  );
}
