import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Timer, X } from "lucide-react";
import { locations, timeGranularities, eventTypes } from "../../data/placeholderData";

export default function FilterSidebar({
  locationId, onLocationChange,
  granularity, onGranularityChange,
  selectedMonth, onMonthChange,
  selectedYear, onYearChange,
  eventType, onEventTypeChange,
  sidebarOpen, onCloseSidebar,
}) {
  const [search, setSearch] = useState("");

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) =>
      `${loc.name} ${loc.state} ${loc.suburbs.join(" ")}`.toLowerCase().includes(q)
    );
  }, [search]);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-slate-200 bg-slate-50 transition-transform duration-200 lg:relative lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Dashboard filters"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-slate-700">Filters</span>
        <button onClick={onCloseSidebar} className="rounded-lg p-1 hover:bg-slate-200" aria-label="Close filters">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        {/* Location search */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> Location
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or suburb..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              aria-label="Search locations"
            />
          </div>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {filteredLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => onLocationChange(loc.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  locationId === loc.id
                    ? "bg-sky-100 font-semibold text-sky-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-pressed={locationId === loc.id}
              >
                <span className={`h-2 w-2 rounded-full ${locationId === loc.id ? "bg-sky-500" : "bg-slate-300"}`} />
                <span className="truncate">{loc.name}</span>
                <span className="ml-auto text-[10px] text-slate-400">{loc.state}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time granularity */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Timer className="h-3.5 w-3.5" /> Time Scale
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200 p-1">
            {timeGranularities.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => onGranularityChange(g.key)}
                className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  granularity === g.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={granularity === g.key}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year selector */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Calendar className="h-3.5 w-3.5" /> Year
          </label>
          <div className="flex gap-1">
            {[2024, 2025].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(y)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  selectedYear === y
                    ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
                aria-pressed={selectedYear === y}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Month picker (visible for daily/monthly) */}
        {(granularity === "daily" || granularity === "monthly") && (
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Calendar className="h-3.5 w-3.5" /> Month
            </label>
            <div className="grid grid-cols-3 gap-1">
              {months.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onMonthChange(i + 1)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    selectedMonth === i + 1
                      ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                  aria-pressed={selectedMonth === i + 1}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Event type */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            aria-label="Select event type"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}

