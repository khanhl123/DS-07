import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Timer, ChevronDown } from "lucide-react";
import { locations, timeGranularities, eventTypes } from "../../data/placeholderData";

export default function HeroSection({
  locationId, onLocationChange,
  granularity, onGranularityChange,
  selectedMonth, onMonthChange,
  selectedYear, onYearChange,
  eventType, onEventTypeChange,
}) {
  const [search, setSearch] = useState("");
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) =>
      `${loc.name} ${loc.state} ${loc.suburbs.join(" ")}`.toLowerCase().includes(q)
    );
  }, [search]);

  const currentLoc = locations.find((l) => l.id === locationId) || locations[0];

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          {/* Left: headline */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)] lg:text-4xl">
              Plan Your Marathon with Confidence
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
              Analyse weather patterns across Australia. Compare locations, evaluate
              date suitability, and make data-driven decisions for your next marathon event.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["8 Cities", "4 Weather Metrics", "Daily to Annual Views"].map((stat) => (
                <span key={stat} className="inline-flex rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                  {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Right: inline filters */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Event Parameters
            </p>

            <div className="space-y-4">
              {/* Location */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLocDropdownOpen(!locDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] hover:border-[var(--accent-blue)]"
                  >
                    <span>{currentLoc.name} ({currentLoc.state})</span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                  {locDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--border)] bg-white shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent-blue)]"
                          />
                        </div>
                      </div>
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => { onLocationChange(loc.id); setLocDropdownOpen(false); setSearch(""); }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-alt)] ${
                            locationId === loc.id ? "bg-blue-50 font-semibold text-[var(--accent-blue)]" : "text-[var(--text)]"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${locationId === loc.id ? "bg-[var(--accent-blue)]" : "bg-[var(--border)]"}`} />
                          {loc.name}
                          <span className="ml-auto text-[10px] text-[var(--text-muted)]">{loc.state}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time scale + Event type row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                    <Timer className="h-3.5 w-3.5" /> Time Scale
                  </label>
                  <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-[var(--surface-alt)] p-0.5">
                    {timeGranularities.map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => onGranularityChange(g.key)}
                        className={`rounded-md px-1.5 py-1.5 text-[11px] font-medium transition ${
                          granularity === g.key
                            ? "bg-white text-[var(--text)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => onEventTypeChange(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent-blue)]"
                  >
                    {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Year + Month row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
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
                            ? "bg-[var(--accent-blue)] text-white shadow-sm"
                            : "border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                {(granularity === "daily" || granularity === "monthly") && (
                  <div>
                    <label className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Month</label>
                    <div className="grid grid-cols-4 gap-0.5">
                      {months.map((m, i) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onMonthChange(i + 1)}
                          className={`rounded-md px-1 py-1.5 text-[11px] font-medium transition ${
                            selectedMonth === i + 1
                              ? "bg-[var(--accent-blue)] text-white shadow-sm"
                              : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

