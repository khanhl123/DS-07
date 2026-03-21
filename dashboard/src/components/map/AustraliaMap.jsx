import { locations } from "../../data/placeholderData";
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

export default function AustraliaMap({ locationId, onSelectLocation, selectedSuburb, onSelectSuburb }) {
  const currentLocation = locations.find((l) => l.id === locationId) || locations[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--marathon-line)] bg-[linear-gradient(180deg,#fbf4ed_0%,#f1e4d6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(231,111,81,0.75)] to-transparent" />
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
                fill={isActive ? "#f4c5b4" : hasLocation ? "#efe4d7" : "#f7f0e8"}
                stroke={isActive ? "#e76f51" : "#ad9888"}
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
                  <circle cx={loc.mapX} cy={loc.mapY} r="5" fill="#e76f51" opacity="0.18">
                    <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={loc.mapX}
                  cy={loc.mapY}
                  r={active ? 3 : 2.2}
                  fill={active ? "#e76f51" : "#c86146"}
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
                  fill={active ? "#9b422d" : "#6b5c51"}
                  textAnchor={loc.mapX > 50 ? "end" : "start"}
                >
                  {loc.state}
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
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelectLocation(loc.id)}
            className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
              locationId === loc.id
                ? "border-[rgba(231,111,81,0.4)] bg-[rgba(231,111,81,0.1)] shadow-[0_12px_24px_rgba(231,111,81,0.1)]"
                : "border-[var(--marathon-line)] bg-[rgba(255,249,243,0.92)] hover:border-[#d4b59c] hover:bg-[#fff3e9]"
            }`}
            aria-pressed={locationId === loc.id}
          >
            <div>
              <span className="font-semibold text-[#241d18]">{loc.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.18em] text-[#a0774e]">{loc.state}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--marathon-accent)]" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
