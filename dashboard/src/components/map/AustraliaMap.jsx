import { useMemo, useState } from "react";
import { locations, suitabilityConfig } from "../../data/placeholderData";
import { ChevronRight } from "lucide-react";

const australiaStates = [
  { id: "WA", name: "Western Australia", path: "M8,25 L8,70 L38,70 L38,55 L32,42 L28,30 L20,22 Z" },
  { id: "NT", name: "Northern Territory", path: "M38,10 L38,42 L55,42 L55,10 Z" },
  { id: "SA", name: "South Australia", path: "M38,42 L38,70 L58,70 L58,55 L55,42 Z" },
  { id: "QLD", name: "Queensland", path: "M55,10 L55,42 L58,50 L72,50 L82,42 L90,28 L85,14 L70,10 Z" },
  { id: "NSW", name: "New South Wales", path: "M58,50 L58,65 L72,68 L82,62 L88,55 L90,48 L82,42 L72,50 Z" },
  { id: "VIC", name: "Victoria", path: "M58,65 L58,70 L62,75 L72,78 L80,72 L82,68 L82,62 L72,68 Z" },
  { id: "TAS", name: "Tasmania", path: "M74,82 L70,88 L72,93 L80,93 L82,88 L78,82 Z" },
  { id: "ACT", name: "Australian Capital Territory", path: "M78,63 L76,65 L78,67 L80,65 Z" },
];

function getLocationSuitability(location, selectedYear, selectedMonth) {
  const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const firstMatch = Object.entries(location.daily).find(([date]) => date.startsWith(prefix));
  return firstMatch?.[1]?.suitability || "slightly_suitable";
}

export default function AustraliaMap({
  locationId,
  onSelectLocation,
  selectedSuburb,
  onSelectSuburb,
  selectedMonth,
  selectedYear,
}) {
  const [hoveredLocationId, setHoveredLocationId] = useState(null);
  const [hoveredStateId, setHoveredStateId] = useState(null);

  const currentLocation = locations.find((l) => l.id === locationId) || locations[0];
  const hoveredLocation = locations.find((l) => l.id === hoveredLocationId) || null;

  const markerSuitability = useMemo(() => {
    return Object.fromEntries(
      locations.map((location) => [
        location.id,
        suitabilityConfig[getLocationSuitability(location, selectedYear, selectedMonth)] || suitabilityConfig.slightly_suitable,
      ])
    );
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--marathon-line)] bg-[linear-gradient(180deg,#fbf4ed_0%,#f1e4d6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(231,111,81,0.75)] to-transparent" />
        {hoveredLocation && (
          <div
            className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 -translate-y-full rounded-xl border border-[rgba(231,111,81,0.42)] bg-[rgba(255,249,243,0.98)] px-3 py-2 shadow-[0_16px_30px_rgba(56,43,31,0.12)]"
            style={{ left: `${hoveredLocation.mapX}%`, top: `${hoveredLocation.mapY}%` }}
            aria-hidden="true"
          >
            <div className="absolute inset-y-2 left-1 w-1 rounded-full bg-[var(--marathon-accent)]" />
            <p className="pl-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8f5438]">{hoveredLocation.name}</p>
            <p className="pl-2 text-[11px] text-[#6f5b4d]">{hoveredLocation.state} | {hoveredLocation.confidence} confidence</p>
          </div>
        )}
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

          {currentLocation && (
            <line
              x1={currentLocation.mapX}
              y1={currentLocation.mapY}
              x2="50"
              y2="97"
              stroke="#d88f73"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          )}

          {australiaStates.map((state) => {
            const hasLocation = locations.some((location) => location.state === state.id);
            const isActive = currentLocation.state === state.id;
            const isHovered = hoveredStateId === state.id;
            const stateTarget = locations.find((location) => location.state === state.id);

            return (
              <path
                key={state.id}
                d={state.path}
                fill={isActive ? "#f6c6ae" : isHovered ? "#f2d3be" : hasLocation ? "#efe4d7" : "#f7f0e8"}
                stroke={isActive ? "#e76f51" : isHovered ? "#c98263" : "#ad9888"}
                strokeWidth={isActive ? "0.9" : isHovered ? "0.65" : "0.4"}
                className={hasLocation ? "cursor-pointer transition-colors duration-200" : "transition-colors duration-200"}
                onMouseEnter={() => setHoveredStateId(state.id)}
                onMouseLeave={() => setHoveredStateId((current) => (current === state.id ? null : current))}
                onClick={() => stateTarget && onSelectLocation(stateTarget.id)}
                tabIndex={hasLocation ? 0 : -1}
                role={hasLocation ? "button" : undefined}
                aria-label={hasLocation ? `Select ${state.name}` : state.name}
                onKeyDown={(event) => {
                  if (hasLocation && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelectLocation(stateTarget.id);
                  }
                }}
              />
            );
          })}

          {locations.map((location) => {
            const active = location.id === locationId;
            const hovered = location.id === hoveredLocationId;
            const suitability = markerSuitability[location.id] || suitabilityConfig.slightly_suitable;

            return (
              <g
                key={location.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLocationId(location.id)}
                onMouseLeave={() => setHoveredLocationId((current) => (current === location.id ? null : current))}
              >
                {active && (
                  <circle cx={location.mapX} cy={location.mapY} r="5" fill="#e76f51" opacity="0.18">
                    <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={location.mapX}
                  cy={location.mapY}
                  r={hovered ? 3.1 : active ? 3 : 2.2}
                  fill={active ? "#e76f51" : "#c86146"}
                  stroke="white"
                  strokeWidth="1"
                  filter="url(#shadow)"
                  className="transition-all duration-200"
                  onClick={() => onSelectLocation(location.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${location.name}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectLocation(location.id);
                    }
                  }}
                />
                <circle
                  cx={location.mapX + 2.4}
                  cy={location.mapY - 2.8}
                  r="1"
                  fill={suitability.hex}
                  stroke="#fff8ef"
                  strokeWidth="0.45"
                  aria-hidden="true"
                />
                <text
                  x={location.mapX + (location.mapX > 50 ? -2 : 4)}
                  y={location.mapY - 4}
                  fontSize="2.8"
                  fontWeight="600"
                  fill={active ? "#9b422d" : "#6b5c51"}
                  textAnchor={location.mapX > 50 ? "end" : "start"}
                >
                  {location.state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-[var(--marathon-line)] bg-[rgba(255,249,243,0.96)] p-4 shadow-[0_14px_28px_rgba(61,46,33,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a6f5c]">Selected City</p>
            <p className="text-sm font-semibold text-[#241d18]">{currentLocation.name}</p>
          </div>
          <span className="rounded-full border border-[rgba(233,196,106,0.45)] bg-[rgba(233,196,106,0.18)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f6b16]">
            {currentLocation.confidence} confidence
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {currentLocation.suburbs.map((suburb) => (
            <button
              key={suburb}
              type="button"
              onClick={() => onSelectSuburb(suburb)}
              className={`rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                selectedSuburb === suburb
                  ? "bg-[rgba(231,111,81,0.16)] text-[#9b422d] ring-1 ring-[rgba(231,111,81,0.38)]"
                  : "bg-[#f6ede4] text-[#69594e] hover:bg-[#efe2d5]"
              }`}
              aria-pressed={selectedSuburb === suburb}
            >
              {suburb}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelectLocation(location.id)}
            className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
              locationId === location.id
                ? "border-[rgba(231,111,81,0.4)] bg-[rgba(231,111,81,0.1)] shadow-[0_12px_24px_rgba(231,111,81,0.1)]"
                : "border-[var(--marathon-line)] bg-[rgba(255,249,243,0.92)] hover:border-[#d4b59c] hover:bg-[#fff3e9]"
            }`}
            aria-pressed={locationId === location.id}
          >
            <div>
              <span className="font-semibold text-[#241d18]">{location.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.18em] text-[#a0774e]">{location.state}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--marathon-accent)]" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
