import { locations, suitabilityConfig } from "../../data/placeholderData";
import { MapPin, ChevronRight } from "lucide-react";

const australiaStates = [
  { id: "WA",  name: "Western Australia",         path: "M8,25 L8,70 L38,70 L38,55 L32,42 L28,30 L20,22 Z",                                fill: "#e2e8f0" },
  { id: "NT",  name: "Northern Territory",         path: "M38,10 L38,42 L55,42 L55,10 Z",                                                    fill: "#e2e8f0" },
  { id: "SA",  name: "South Australia",            path: "M38,42 L38,70 L58,70 L58,55 L55,42 Z",                                             fill: "#e2e8f0" },
  { id: "QLD", name: "Queensland",                 path: "M55,10 L55,42 L58,50 L72,50 L82,42 L90,28 L85,14 L70,10 Z",                        fill: "#e2e8f0" },
  { id: "NSW", name: "New South Wales",            path: "M58,50 L58,65 L72,68 L82,62 L88,55 L90,48 L82,42 L72,50 Z",                        fill: "#e2e8f0" },
  { id: "VIC", name: "Victoria",                   path: "M58,65 L58,70 L62,75 L72,78 L80,72 L82,68 L82,62 L72,68 Z",                        fill: "#e2e8f0" },
  { id: "TAS", name: "Tasmania",                   path: "M74,82 L70,88 L72,93 L80,93 L82,88 L78,82 Z",                                      fill: "#e2e8f0" },
  { id: "ACT", name: "Australian Capital Territory",path: "M78,63 L76,65 L78,67 L80,65 Z",                                                   fill: "#e2e8f0" },
];

export default function AustraliaMap({ locationId, onSelectLocation, selectedSuburb, onSelectSuburb }) {
  const currentLocation = locations.find((l) => l.id === locationId) || locations[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-cyan-50/50 to-slate-50">
        <svg
          viewBox="0 0 100 100"
          className="h-[280px] w-full"
          role="img"
          aria-label="Map of Australia showing selectable marathon locations"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.6" floodOpacity="0.15" />
            </filter>
          </defs>

          {australiaStates.map((state) => {
            const hasLocation = locations.some((l) => l.state === state.id);
            const isActive = currentLocation.state === state.id;
            return (
              <path
                key={state.id}
                d={state.path}
                fill={isActive ? "#bae6fd" : hasLocation ? "#f1f5f9" : "#f8fafc"}
                stroke={isActive ? "#0284c7" : "#94a3b8"}
                strokeWidth={isActive ? "0.8" : "0.4"}
                className="transition-colors duration-150"
              />
            );
          })}

          {locations.map((loc) => {
            const active = loc.id === locationId;
            return (
              <g key={loc.id} className="cursor-pointer">
                {active && (
                  <circle cx={loc.mapX} cy={loc.mapY} r="5" fill="#0284c7" opacity="0.15">
                    <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={loc.mapX}
                  cy={loc.mapY}
                  r={active ? 3 : 2.2}
                  fill={active ? "#0284c7" : "#64748b"}
                  stroke="white"
                  strokeWidth="1"
                  filter="url(#shadow)"
                  onClick={() => onSelectLocation(loc.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${loc.name}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectLocation(loc.id); }}}
                />
                <text
                  x={loc.mapX + (loc.mapX > 50 ? -2 : 4)}
                  y={loc.mapY - 4}
                  fontSize="2.8"
                  fontWeight="600"
                  fill={active ? "#0284c7" : "#475569"}
                  textAnchor={loc.mapX > 50 ? "end" : "start"}
                >
                  {loc.state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Suburb drill-down */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected City</p>
            <p className="text-sm font-semibold text-slate-900">{currentLocation.name}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
            {currentLocation.confidence} confidence
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {currentLocation.suburbs.map((suburb) => (
            <button
              key={suburb}
              type="button"
              onClick={() => onSelectSuburb(suburb)}
              className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                selectedSuburb === suburb
                  ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
              aria-pressed={selectedSuburb === suburb}
            >
              {suburb}
            </button>
          ))}
        </div>
      </div>

      {/* Location cards */}
      <div className="grid gap-2 sm:grid-cols-2">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelectLocation(loc.id)}
            className={`group flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              locationId === loc.id
                ? "border-sky-400 bg-sky-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
            aria-pressed={locationId === loc.id}
          >
            <div>
              <span className="font-semibold text-slate-900">{loc.name}</span>
              <span className="ml-2 text-xs text-slate-400">{loc.state}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
