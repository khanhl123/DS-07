import { locations, getDataForGranularity, suitabilityConfig } from "../../data/placeholderData";
import { ChevronRight } from "lucide-react";

const australiaStates = [
  { id: "WA",  path: "M8,25 L8,70 L38,70 L38,55 L32,42 L28,30 L20,22 Z" },
  { id: "NT",  path: "M38,10 L38,42 L55,42 L55,10 Z" },
  { id: "SA",  path: "M38,42 L38,70 L58,70 L58,55 L55,42 Z" },
  { id: "QLD", path: "M55,10 L55,42 L58,50 L72,50 L82,42 L90,28 L85,14 L70,10 Z" },
  { id: "NSW", path: "M58,50 L58,65 L72,68 L82,62 L88,55 L90,48 L82,42 L72,50 Z" },
  { id: "VIC", path: "M58,65 L58,70 L62,75 L72,78 L80,72 L82,68 L82,62 L72,68 Z" },
  { id: "TAS", path: "M74,82 L70,88 L72,93 L80,93 L82,88 L78,82 Z" },
  { id: "ACT", path: "M78,63 L76,65 L78,67 L80,65 Z" },
];

export default function AustraliaMap({ locationId, onSelectLocation, selectedSuburb, onSelectSuburb, selectedMonth, selectedYear }) {
  const currentLocation = locations.find((l) => l.id === locationId) || locations[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
        <svg viewBox="0 0 100 100" className="h-[280px] w-full" role="img" aria-label="Map of Australia showing selectable marathon locations">
          {australiaStates.map((state) => {
            const hasLoc = locations.some((l) => l.state === state.id);
            const isActive = currentLocation.state === state.id;
            return (
              <path
                key={state.id}
                d={state.path}
                fill={isActive ? "#bee3f8" : hasLoc ? "#edf2f7" : "#f7fafc"}
                stroke={isActive ? "#3182ce" : "#a0aec0"}
                strokeWidth={isActive ? "0.8" : "0.4"}
                className="transition-colors duration-150"
              />
            );
          })}
          {locations.map((loc) => {
            const active = loc.id === locationId;
            const dailyData = getDataForGranularity(loc, "daily", selectedYear || 2025, selectedMonth || 9);
            const avgSuit = dailyData.length > 0 ? dailyData[0].suitability : "slightly_suitable";
            const dotColor = avgSuit === "suitable" ? "#2b8a3e" : avgSuit === "not_suitable" ? "#e53e3e" : "#d69e2e";
            return (
              <g key={loc.id} className="cursor-pointer">
                {active && (
                  <circle cx={loc.mapX} cy={loc.mapY} r="5" fill="#3182ce" opacity="0.12">
                    <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={loc.mapX} cy={loc.mapY} r={active ? 3 : 2.2}
                  fill={active ? "#1e3a5f" : "#4a5568"}
                  stroke="white" strokeWidth="1"
                  onClick={() => onSelectLocation(loc.id)}
                  tabIndex={0} role="button" aria-label={`Select ${loc.name}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectLocation(loc.id); }}}
                />
                <circle cx={loc.mapX + 4} cy={loc.mapY - 3} r="1.5" fill={dotColor} stroke="white" strokeWidth="0.4" />
                <text x={loc.mapX + (loc.mapX > 50 ? -2 : 6)} y={loc.mapY - 4} fontSize="2.8" fontWeight="600" fill={active ? "#1e3a5f" : "#4a5568"} textAnchor={loc.mapX > 50 ? "end" : "start"}>
                  {loc.state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Selected City</p>
            <p className="text-sm font-semibold text-[var(--text)]">{currentLocation.name}</p>
          </div>
          <span className="rounded-md bg-[var(--surface-alt)] px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)]">
            {currentLocation.confidence} confidence
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {currentLocation.suburbs.map((suburb) => (
            <button
              key={suburb} type="button" onClick={() => onSelectSuburb(suburb)}
              className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                selectedSuburb === suburb ? "bg-blue-50 text-[var(--accent-blue)] ring-1 ring-blue-200" : "bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
              }`}
              aria-pressed={selectedSuburb === suburb}
            >{suburb}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {locations.map((loc) => (
          <button key={loc.id} type="button" onClick={() => onSelectLocation(loc.id)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              locationId === loc.id ? "border-blue-300 bg-blue-50 shadow-sm" : "border-[var(--border)] bg-white hover:bg-[var(--bg)]"
            }`}
            aria-pressed={locationId === loc.id}
          >
            <div>
              <span className="font-semibold text-[var(--text)]">{loc.name}</span>
              <span className="ml-2 text-xs text-[var(--text-muted)]">{loc.state}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </button>
        ))}
      </div>
    </div>
  );
}
