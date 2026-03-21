import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Timer, ChevronDown } from "lucide-react";
import { locations, timeGranularities, eventTypes } from "../../data/placeholderData";

export default function DateAnalysisFilters({
  locationId, onLocationChange,
  granularity, onGranularityChange,
  selectedMonth, onMonthChange,
  selectedYear, onYearChange,
  eventType, onEventTypeChange,
}) {
  const [search, setSearch] = useState("");
  const [locOpen, setLocOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) => `${l.name} ${l.state}`.toLowerCase().includes(q));
  }, [search]);

  const loc = locations.find((l) => l.id === locationId) || locations[0];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Event Parameters
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Location */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <MapPin className="h-3.5 w-3.5" /> Location
          </label>
          <div className="relative">
            <button type="button" onClick={() => setLocOpen(!locOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] hover:border-[var(--accent-blue)]">
              <span className="truncate">{loc.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            </button>
            {locOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--border)] bg-white shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent-blue)]" />
                  </div>
                </div>
                {filtered.map((l) => (
                  <button key={l.id} type="button"
                    onClick={() => { onLocationChange(l.id); setLocOpen(false); setSearch(""); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-alt)] ${locationId === l.id ? "bg-blue-50 font-semibold text-[var(--accent-blue)]" : "text-[var(--text)]"}`}>
                    <span className={`h-2 w-2 rounded-full ${locationId === l.id ? "bg-[var(--accent-blue)]" : "bg-[var(--border)]"}`} />
                    {l.name}
                    <span className="ml-auto text-[10px] text-[var(--text-muted)]">{l.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event type */}
        <div>
          <label className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Event Type</label>
          <select value={eventType} onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-blue)]">
            {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Time scale + Year */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Timer className="h-3.5 w-3.5" /> Time Scale
          </label>
          <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-[var(--surface-alt)] p-0.5">
            {timeGranularities.map((g) => (
              <button key={g.key} type="button" onClick={() => onGranularityChange(g.key)}
                className={`rounded-md px-1.5 py-2 text-[11px] font-medium transition ${granularity === g.key ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year + Month */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Calendar className="h-3.5 w-3.5" /> Year / Month
          </label>
          <div className="flex gap-1">
            {[2024, 2025].map((y) => (
              <button key={y} type="button" onClick={() => onYearChange(y)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition ${selectedYear === y ? "bg-[var(--accent-blue)] text-white shadow-sm" : "border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"}`}>
                {y}
              </button>
            ))}
          </div>
          {(granularity === "daily" || granularity === "monthly") && (
            <div className="mt-2 grid grid-cols-6 gap-0.5">
              {months.map((m, i) => (
                <button key={m} type="button" onClick={() => onMonthChange(i + 1)}
                  className={`rounded-md px-1 py-1 text-[10px] font-medium transition ${selectedMonth === i + 1 ? "bg-[var(--accent-blue)] text-white" : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)]"}`}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
