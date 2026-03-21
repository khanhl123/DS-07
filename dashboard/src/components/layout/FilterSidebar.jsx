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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-[rgba(233,196,106,0.14)] bg-[linear-gradient(180deg,#10202f_0%,#172535_48%,#1f2b3a_100%)] text-[#f7ede3] shadow-[18px_0_30px_rgba(13,27,42,0.24)] transition-transform duration-200 lg:relative lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Dashboard filters"
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(231,111,81,0.9)] to-transparent" />
      <div className="flex items-center justify-between border-b border-[rgba(255,248,239,0.08)] px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--marathon-gold)]">Filters</span>
        <button
          onClick={onCloseSidebar}
          className="rounded-lg p-1 text-[#f7ede3] transition hover:bg-[rgba(255,255,255,0.08)]"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div className="border-t border-[rgba(255,248,239,0.08)] pt-4 first:border-t-0 first:pt-0">
          <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--marathon-gold)]">
            <MapPin className="h-3.5 w-3.5 text-[var(--marathon-accent)]" /> Location
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[rgba(247,237,227,0.45)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or suburb..."
              className="w-full rounded-xl border border-[rgba(255,248,239,0.14)] bg-[rgba(255,255,255,0.06)] py-2.5 pl-9 pr-3 text-sm text-[#fff8ef] outline-none placeholder:text-[rgba(247,237,227,0.45)] focus:border-[var(--marathon-accent)] focus:ring-2 focus:ring-[rgba(231,111,81,0.22)]"
              aria-label="Search locations"
            />
          </div>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {filteredLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => onLocationChange(loc.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  locationId === loc.id
                    ? "bg-[linear-gradient(135deg,rgba(231,111,81,0.28),rgba(233,196,106,0.2))] font-semibold text-[#fffaf5] ring-1 ring-[rgba(244,132,95,0.65)] shadow-[0_12px_24px_rgba(231,111,81,0.18)]"
                    : "bg-[rgba(255,255,255,0.04)] text-[#f4e7da] hover:bg-[rgba(255,255,255,0.08)]"
                }`}
                aria-pressed={locationId === loc.id}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${locationId === loc.id ? "bg-[var(--marathon-accent)]" : "bg-[rgba(233,196,106,0.55)]"}`} />
                <span className="truncate">{loc.name}</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-[rgba(233,196,106,0.86)]">{loc.state}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(255,248,239,0.08)] pt-4">
          <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--marathon-gold)]">
            <Timer className="h-3.5 w-3.5 text-[var(--marathon-accent)]" /> Time Scale
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[rgba(255,255,255,0.08)] p-1 ring-1 ring-[rgba(255,248,239,0.08)]">
            {timeGranularities.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => onGranularityChange(g.key)}
                className={`rounded-xl px-2 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                  granularity === g.key
                    ? "bg-[#fff8ef] text-[var(--marathon-ink)] shadow-[0_10px_18px_rgba(13,27,42,0.18)]"
                    : "text-[rgba(247,237,227,0.7)] hover:text-[#fffaf5]"
                }`}
                aria-pressed={granularity === g.key}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(255,248,239,0.08)] pt-4">
          <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--marathon-gold)]">
            <Calendar className="h-3.5 w-3.5 text-[var(--marathon-accent)]" /> Year
          </label>
          <div className="flex gap-1">
            {[2024, 2025].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(y)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  selectedYear === y
                    ? "bg-[var(--marathon-accent)] text-white ring-1 ring-[rgba(244,132,95,0.72)] shadow-[0_10px_18px_rgba(231,111,81,0.22)]"
                    : "bg-[rgba(255,255,255,0.05)] text-[#f3e6d8] ring-1 ring-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
                aria-pressed={selectedYear === y}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {(granularity === "daily" || granularity === "monthly") && (
          <div className="border-t border-[rgba(255,248,239,0.08)] pt-4">
            <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--marathon-gold)]">
              <Calendar className="h-3.5 w-3.5 text-[var(--marathon-accent)]" /> Month
            </label>
            <div className="grid grid-cols-3 gap-1">
              {months.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onMonthChange(i + 1)}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    selectedMonth === i + 1
                      ? "bg-[rgba(233,196,106,0.18)] text-[#fff8ef] ring-1 ring-[rgba(233,196,106,0.45)]"
                      : "bg-[rgba(255,255,255,0.05)] text-[#f1e1d1] ring-1 ring-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)]"
                  }`}
                  aria-pressed={selectedMonth === i + 1}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[rgba(255,248,239,0.08)] pt-4">
          <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--marathon-gold)]">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full rounded-xl border border-[rgba(255,248,239,0.14)] bg-[#fff8ef] px-3 py-2.5 text-sm font-medium text-[#2f2722] outline-none focus:border-[var(--marathon-accent)] focus:ring-2 focus:ring-[rgba(231,111,81,0.2)]"
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
