import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Gauge,
  Download,
  RotateCcw,
  Search,
  BarChart3,
  Clock3,
  ShieldCheck,
  ChevronRight,
  CloudSun,
  Map,
  Route,
} from "lucide-react";

const locations = [
  {
    id: "melbourne",
    name: "Melbourne CBD",
    state: "VIC",
    x: 72,
    y: 78,
    confidence: "High",
    summary: "Cooler mornings and comparatively stable wind make Melbourne one of the most reliable options for long-distance events.",
    drilldown: ["Melbourne CBD", "Albert Park", "St Kilda", "Docklands"],
    dates: [
      { day: 1, label: "Moderate", score: 68, temp: 18, wind: 16, humidity: 63, uv: 5, rain: 22, recommendedStart: "7:00 AM" },
      { day: 2, label: "Moderate", score: 70, temp: 17, wind: 14, humidity: 62, uv: 5, rain: 18, recommendedStart: "7:00 AM" },
      { day: 3, label: "High Risk", score: 44, temp: 24, wind: 28, humidity: 70, uv: 7, rain: 35, recommendedStart: "6:30 AM" },
      { day: 4, label: "Safe", score: 84, temp: 15, wind: 11, humidity: 58, uv: 4, rain: 10, recommendedStart: "7:30 AM" },
      { day: 5, label: "Safe", score: 86, temp: 14, wind: 10, humidity: 57, uv: 4, rain: 8, recommendedStart: "7:30 AM" },
      { day: 6, label: "Moderate", score: 66, temp: 19, wind: 18, humidity: 66, uv: 6, rain: 20, recommendedStart: "7:00 AM" },
      { day: 7, label: "Moderate", score: 61, temp: 21, wind: 20, humidity: 69, uv: 6, rain: 25, recommendedStart: "6:30 AM" },
      { day: 8, label: "Safe", score: 82, temp: 16, wind: 12, humidity: 59, uv: 4, rain: 12, recommendedStart: "7:30 AM" },
      { day: 9, label: "Safe", score: 88, temp: 14, wind: 9, humidity: 56, uv: 4, rain: 7, recommendedStart: "7:30 AM" },
      { day: 10, label: "High Risk", score: 40, temp: 27, wind: 24, humidity: 72, uv: 8, rain: 30, recommendedStart: "6:00 AM" },
      { day: 11, label: "Moderate", score: 63, temp: 20, wind: 17, humidity: 65, uv: 6, rain: 19, recommendedStart: "7:00 AM" },
      { day: 12, label: "Safe", score: 85, temp: 15, wind: 10, humidity: 60, uv: 4, rain: 8, recommendedStart: "7:30 AM" },
      { day: 13, label: "Safe", score: 83, temp: 16, wind: 11, humidity: 58, uv: 4, rain: 10, recommendedStart: "7:30 AM" },
      { day: 14, label: "Moderate", score: 67, temp: 19, wind: 16, humidity: 63, uv: 5, rain: 15, recommendedStart: "7:00 AM" },
    ],
  },
  {
    id: "sydney",
    name: "Sydney Olympic Park",
    state: "NSW",
    x: 84,
    y: 66,
    confidence: "Medium",
    summary: "Sydney is often workable, but humidity and rain variability make the safest date window narrower than Melbourne or Perth.",
    drilldown: ["Sydney Olympic Park", "Parramatta", "Bondi", "Homebush"],
    dates: [
      { day: 1, label: "Moderate", score: 64, temp: 21, wind: 15, humidity: 71, uv: 6, rain: 24, recommendedStart: "6:30 AM" },
      { day: 2, label: "Moderate", score: 66, temp: 20, wind: 14, humidity: 70, uv: 6, rain: 20, recommendedStart: "6:30 AM" },
      { day: 3, label: "High Risk", score: 43, temp: 26, wind: 23, humidity: 75, uv: 8, rain: 38, recommendedStart: "6:00 AM" },
      { day: 4, label: "Safe", score: 80, temp: 18, wind: 11, humidity: 65, uv: 5, rain: 12, recommendedStart: "7:00 AM" },
      { day: 5, label: "Safe", score: 82, temp: 17, wind: 10, humidity: 63, uv: 5, rain: 10, recommendedStart: "7:00 AM" },
      { day: 6, label: "Moderate", score: 60, temp: 22, wind: 18, humidity: 73, uv: 6, rain: 22, recommendedStart: "6:30 AM" },
      { day: 7, label: "Moderate", score: 58, temp: 23, wind: 20, humidity: 74, uv: 7, rain: 25, recommendedStart: "6:30 AM" },
      { day: 8, label: "Safe", score: 79, temp: 18, wind: 12, humidity: 64, uv: 5, rain: 11, recommendedStart: "7:00 AM" },
      { day: 9, label: "Safe", score: 83, temp: 17, wind: 11, humidity: 62, uv: 5, rain: 9, recommendedStart: "7:00 AM" },
      { day: 10, label: "High Risk", score: 41, temp: 28, wind: 24, humidity: 77, uv: 8, rain: 34, recommendedStart: "6:00 AM" },
      { day: 11, label: "Moderate", score: 62, temp: 21, wind: 16, humidity: 71, uv: 6, rain: 20, recommendedStart: "6:30 AM" },
      { day: 12, label: "Safe", score: 81, temp: 18, wind: 11, humidity: 64, uv: 5, rain: 10, recommendedStart: "7:00 AM" },
      { day: 13, label: "Safe", score: 80, temp: 18, wind: 12, humidity: 65, uv: 5, rain: 11, recommendedStart: "7:00 AM" },
      { day: 14, label: "Moderate", score: 65, temp: 20, wind: 14, humidity: 69, uv: 6, rain: 18, recommendedStart: "6:30 AM" },
    ],
  },
  {
    id: "brisbane",
    name: "South Bank, Brisbane",
    state: "QLD",
    x: 85,
    y: 45,
    confidence: "Medium",
    summary: "Brisbane remains attractive for event logistics, but warmer mornings and higher humidity increase physiological strain for full marathons.",
    drilldown: ["South Bank", "Brisbane CBD", "Kangaroo Point", "New Farm"],
    dates: [
      { day: 1, label: "High Risk", score: 46, temp: 27, wind: 14, humidity: 79, uv: 8, rain: 36, recommendedStart: "5:45 AM" },
      { day: 2, label: "Moderate", score: 57, temp: 24, wind: 13, humidity: 76, uv: 7, rain: 24, recommendedStart: "6:00 AM" },
      { day: 3, label: "High Risk", score: 39, temp: 29, wind: 17, humidity: 80, uv: 9, rain: 41, recommendedStart: "5:30 AM" },
      { day: 4, label: "Moderate", score: 60, temp: 23, wind: 12, humidity: 74, uv: 7, rain: 18, recommendedStart: "6:00 AM" },
      { day: 5, label: "Moderate", score: 63, temp: 22, wind: 11, humidity: 72, uv: 6, rain: 16, recommendedStart: "6:15 AM" },
      { day: 6, label: "High Risk", score: 48, temp: 26, wind: 14, humidity: 78, uv: 8, rain: 28, recommendedStart: "5:45 AM" },
      { day: 7, label: "Moderate", score: 55, temp: 24, wind: 15, humidity: 75, uv: 7, rain: 21, recommendedStart: "6:00 AM" },
      { day: 8, label: "Moderate", score: 61, temp: 23, wind: 11, humidity: 73, uv: 6, rain: 17, recommendedStart: "6:15 AM" },
      { day: 9, label: "Safe", score: 76, temp: 20, wind: 10, humidity: 68, uv: 5, rain: 12, recommendedStart: "6:30 AM" },
      { day: 10, label: "High Risk", score: 42, temp: 28, wind: 16, humidity: 79, uv: 9, rain: 33, recommendedStart: "5:30 AM" },
      { day: 11, label: "Moderate", score: 58, temp: 24, wind: 12, humidity: 75, uv: 7, rain: 20, recommendedStart: "6:00 AM" },
      { day: 12, label: "Safe", score: 74, temp: 21, wind: 10, humidity: 69, uv: 5, rain: 13, recommendedStart: "6:30 AM" },
      { day: 13, label: "Moderate", score: 62, temp: 22, wind: 11, humidity: 72, uv: 6, rain: 17, recommendedStart: "6:15 AM" },
      { day: 14, label: "Moderate", score: 59, temp: 23, wind: 12, humidity: 73, uv: 6, rain: 18, recommendedStart: "6:15 AM" },
    ],
  },
  {
    id: "perth",
    name: "Perth Riverside",
    state: "WA",
    x: 16,
    y: 62,
    confidence: "High",
    summary: "Perth scores strongly because several dates combine cool temperatures, lower humidity, and lower rain probability.",
    drilldown: ["Perth Riverside", "Kings Park", "Subiaco", "East Perth"],
    dates: [
      { day: 1, label: "Safe", score: 81, temp: 17, wind: 13, humidity: 58, uv: 5, rain: 9, recommendedStart: "7:00 AM" },
      { day: 2, label: "Safe", score: 84, temp: 16, wind: 12, humidity: 57, uv: 5, rain: 7, recommendedStart: "7:15 AM" },
      { day: 3, label: "Moderate", score: 65, temp: 21, wind: 18, humidity: 63, uv: 6, rain: 15, recommendedStart: "6:45 AM" },
      { day: 4, label: "Safe", score: 86, temp: 15, wind: 10, humidity: 56, uv: 4, rain: 6, recommendedStart: "7:15 AM" },
      { day: 5, label: "Safe", score: 88, temp: 14, wind: 9, humidity: 55, uv: 4, rain: 5, recommendedStart: "7:30 AM" },
      { day: 6, label: "Moderate", score: 67, temp: 20, wind: 17, humidity: 61, uv: 6, rain: 13, recommendedStart: "6:45 AM" },
      { day: 7, label: "Moderate", score: 63, temp: 22, wind: 18, humidity: 64, uv: 6, rain: 15, recommendedStart: "6:30 AM" },
      { day: 8, label: "Safe", score: 85, temp: 15, wind: 10, humidity: 56, uv: 4, rain: 6, recommendedStart: "7:15 AM" },
      { day: 9, label: "Safe", score: 89, temp: 13, wind: 8, humidity: 54, uv: 4, rain: 4, recommendedStart: "7:30 AM" },
      { day: 10, label: "Moderate", score: 61, temp: 23, wind: 19, humidity: 66, uv: 7, rain: 14, recommendedStart: "6:30 AM" },
      { day: 11, label: "Moderate", score: 68, temp: 19, wind: 15, humidity: 60, uv: 5, rain: 12, recommendedStart: "6:45 AM" },
      { day: 12, label: "Safe", score: 86, temp: 15, wind: 9, humidity: 55, uv: 4, rain: 5, recommendedStart: "7:15 AM" },
      { day: 13, label: "Safe", score: 87, temp: 14, wind: 9, humidity: 55, uv: 4, rain: 5, recommendedStart: "7:15 AM" },
      { day: 14, label: "Safe", score: 80, temp: 17, wind: 12, humidity: 58, uv: 5, rain: 8, recommendedStart: "7:00 AM" },
    ],
  },
];

const eventAdjustments = {
  Marathon: -4,
  "Half Marathon": 0,
  "10K": 4,
};

const riskConfig = {
  Safe: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  Moderate: {
    dot: "bg-amber-400",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertTriangle,
  },
  "High Risk": {
    dot: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    icon: AlertTriangle,
  },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getAdjustedDay(day, eventType) {
  const delta = eventAdjustments[eventType] || 0;
  const score = clamp(day.score + delta, 0, 100);
  const label = score >= 75 ? "Safe" : score >= 55 ? "Moderate" : "High Risk";
  return { ...day, score, label };
}

function deriveSimpleChartData(day) {
  return [
    { label: "Temp", short: "°C", value: day.temp, max: 35, color: "bg-slate-700" },
    { label: "Humidity", short: "%", value: day.humidity, max: 100, color: "bg-sky-600" },
    { label: "Wind", short: "km/h", value: day.wind, max: 40, color: "bg-violet-600" },
    { label: "Rain", short: "%", value: day.rain, max: 100, color: "bg-cyan-600" },
  ];
}

function deriveHourlyWeather(day) {
  return [
    { hour: "5 AM", temp: Math.max(10, day.temp - 3), humidity: Math.min(100, day.humidity + 6), wind: Math.max(5, day.wind - 2) },
    { hour: "6 AM", temp: Math.max(10, day.temp - 2), humidity: Math.min(100, day.humidity + 4), wind: Math.max(5, day.wind - 1) },
    { hour: "7 AM", temp: day.temp, humidity: day.humidity, wind: day.wind },
    { hour: "8 AM", temp: day.temp + 2, humidity: Math.max(40, day.humidity - 3), wind: day.wind + 1 },
    { hour: "9 AM", temp: day.temp + 4, humidity: Math.max(40, day.humidity - 6), wind: day.wind + 2 },
  ];
}

function deriveRiskBars(day) {
  return [
    { label: "Heat", value: clamp(day.temp * 3.2, 0, 100), color: "bg-rose-500" },
    { label: "Humidity", value: clamp(day.humidity, 0, 100), color: "bg-sky-600" },
    { label: "Wind", value: clamp(day.wind * 2.5, 0, 100), color: "bg-violet-600" },
    { label: "Rain", value: clamp(day.rain, 0, 100), color: "bg-cyan-600" },
  ];
}

function getLocationMarkerTone(active) {
  return active ? "fill-slate-900 stroke-white" : "fill-sky-600 stroke-white";
}

function Card({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-[26px] border border-white/70 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}>
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        {Icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function SummaryMetric({ icon: Icon, label, value, dark = false }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${dark ? "border-white/15 bg-white text-slate-950" : "border-slate-200 bg-white text-slate-950"}`}>
      <div className={`flex items-center gap-2 ${dark ? "text-slate-500" : "text-slate-500"}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function AustraliaMap({ selectedId, onSelect, locations, selectedSuburb, onSelectSuburb }) {
  const activeLocation = locations.find((loc) => loc.id === selectedId) || locations[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-100 via-cyan-50 to-slate-100 p-4 shadow-inner">
        <svg viewBox="0 0 100 78" className="relative h-[300px] w-full" role="img" aria-label="Stylised Australia map with selectable marathon locations">
          <defs>
            <linearGradient id="landFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <path d="M10 28 C15 20, 30 13, 41 15 C52 17, 63 16, 73 22 C80 26, 87 37, 90 45 C91 50, 88 57, 83 61 C79 64, 74 69, 66 68 C60 71, 53 70, 48 65 C43 68, 34 67, 28 63 C23 60, 20 57, 18 52 C14 49, 10 42, 10 35 Z" fill="url(#landFill)" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M57 67 C59 72, 60 75, 58 77 C55 76, 53 74, 52 70" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <path d="M22 37 L86 37" stroke="#cbd5e1" strokeDasharray="1.6 1.6" />
          <path d="M48 18 L48 66" stroke="#cbd5e1" strokeDasharray="1.6 1.6" />
          <text x="42" y="43" fontSize="4" fill="#64748b">Australia</text>
          {locations.map((loc) => {
            const active = loc.id === selectedId;
            return (
              <g key={loc.id}>
                <circle cx={loc.x} cy={loc.y + 1.1} r={active ? 4.2 : 3.3} fill="rgba(15,23,42,0.12)" />
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={active ? 3.5 : 2.8}
                  className={`cursor-pointer ${getLocationMarkerTone(active)}`}
                  strokeWidth="1.6"
                  onClick={() => onSelect(loc.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${loc.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(loc.id);
                    }
                  }}
                />
                <text x={loc.x + 2.7} y={loc.y - 2.2} fontSize="3.1" fill="#334155">{loc.state}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Map className="h-4 w-4" aria-hidden="true" />
          Drill down into marathon area
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected city</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{activeLocation.name}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {activeLocation.drilldown.map((suburb) => (
                <button
                  key={suburb}
                  type="button"
                  onClick={() => onSelectSuburb(suburb)}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                    selectedSuburb === suburb ? "border-sky-500 bg-sky-50 text-sky-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">{suburb}</div>
                  <div className="mt-1 text-xs text-slate-500">Possible marathon route area</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Route className="h-4 w-4" aria-hidden="true" />
              Area selected
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">{selectedSuburb}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">This area can represent the specific suburb, park, or route zone where the marathon event is planned.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc.id)}
            className={`group rounded-2xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
              selectedId === loc.id ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
            aria-pressed={selectedId === loc.id}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{loc.name}</div>
                <div className="mt-1 text-xs text-slate-500">{loc.confidence} forecast confidence</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CalendarGrid({ selectedDay, days, onSelectDay, selectedRange, onSelectRange }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Calendar legend">
          {Object.entries(riskConfig).map(([label, cfg]) => (
            <div key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              <span className={`h-3 w-3 rounded-full ${cfg.dot}`} aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <Badge className="border border-slate-200 bg-slate-50 text-slate-700">September 2025</Badge>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm text-slate-700">
          <span className="mb-1.5 block font-semibold">Event duration</span>
          <select
            value={selectedRange}
            onChange={(e) => onSelectRange(Number(e.target.value))}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-label="Choose marathon date range"
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
          </select>
        </label>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Selected range: <span className="font-semibold text-slate-900">{selectedDay}–{Math.min(selectedDay + selectedRange - 1, days[days.length - 1]?.day || selectedDay)} Sep 2025</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50/70">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-3">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[98px] bg-slate-50" aria-hidden="true" />
          ))}
          {days.map((day) => {
            const cfg = riskConfig[day.label];
            const rangeEnd = selectedDay + selectedRange - 1;
            const inRange = day.day >= selectedDay && day.day <= rangeEnd;
            const active = day.day === selectedDay;
            const Icon = cfg.icon;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => onSelectDay(day.day)}
                className={`min-h-[98px] bg-white p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 ${active ? "relative z-10 ring-2 ring-slate-900" : "hover:bg-slate-50"} ${inRange ? "bg-sky-50" : ""}`}
                aria-pressed={active}
                aria-label={`Day ${day.day}, ${day.label}, score ${day.score}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{day.day}</span>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${cfg.chip}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                  <span>{day.label}</span>
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">{day.score}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimpleWeatherChart({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{item.value}{item.short}</div>
            <div className="mt-3 h-3 rounded-full bg-white">
              <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${(item.value / item.max) * 100}%` }} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Weather metric table alternative</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label} className="border-t border-slate-100 text-slate-700">
                <td className="px-4 py-3 font-medium">{item.label}</td>
                <td className="px-4 py-3">{item.value}{item.short}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemperatureLineChart({ data }) {
  const maxTemp = Math.max(...data.map((item) => item.temp), 1);
  const minTemp = Math.min(...data.map((item) => item.temp), 0);
  const range = Math.max(1, maxTemp - minTemp);
  const points = data
    .map((item, index) => {
      const x = 20 + index * 60;
      const y = 110 - ((item.temp - minTemp) / range) * 60;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 280 140" className="h-40 w-full rounded-2xl border border-slate-200 bg-white p-3" role="img" aria-label="Morning temperature line chart">
        <line x1="20" y1="110" x2="260" y2="110" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="30" x2="20" y2="110" stroke="#cbd5e1" strokeWidth="1" />
        <polyline fill="none" stroke="#334155" strokeWidth="3" points={points} />
        {data.map((item, index) => {
          const x = 20 + index * 60;
          const y = 110 - ((item.temp - minTemp) / range) * 60;
          return (
            <g key={item.hour}>
              <circle cx={x} cy={y} r="4" fill="#334155" />
              <text x={x} y="126" textAnchor="middle" fontSize="10" fill="#64748b">{item.hour}</text>
              <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#0f172a">{item.temp}°</text>
            </g>
          );
        })}
      </svg>
      <p className="text-sm text-slate-600">Morning temperature rises through the race window, so earlier starts are generally safer.</p>
    </div>
  );
}

function WeatherBarChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex h-40 items-end justify-between gap-4">
          {data.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-xs font-semibold text-slate-700">{item.value}</div>
              <div className="flex h-28 w-full items-end rounded-t-xl bg-slate-100 px-2">
                <div className={`w-full rounded-t-xl ${item.color}`} style={{ height: `${(item.value / maxValue) * 100}%` }} aria-hidden="true" />
              </div>
              <div className="text-xs font-medium text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-600">This bar chart compares humidity, wind, and rain with heat risk in one simple view.</p>
    </div>
  );
}

function RiskLevelChart({ data }) {
  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <span className="font-medium">{item.label}</span>
              <span>{Math.round(item.value)}/100</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-600">These planning risk bars turn weather variables into easy-to-read race risk levels.</p>
    </div>
  );
}

export default function MarathonWeatherDashboard() {
  const [locationId, setLocationId] = useState("melbourne");
  const [selectedDay, setSelectedDay] = useState(5);
  const [selectedRange, setSelectedRange] = useState(3);
  const [eventType, setEventType] = useState("Marathon");
  const [search, setSearch] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("Melbourne CBD");

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => `${loc.name} ${loc.state}`.toLowerCase().includes(q));
  }, [search]);

  const currentLocation = locations.find((l) => l.id === locationId) || locations[0];
  const activeFilteredLocations = filteredLocations.length ? filteredLocations : locations;
  const calendarDays = currentLocation.dates.map((d) => getAdjustedDay(d, eventType));
  const safeSelectedDay = Math.min(selectedDay, Math.max(1, 15 - selectedRange));
  const day = calendarDays.find((d) => d.day === safeSelectedDay) || calendarDays[0];
  const selectedDays = calendarDays.filter((d) => d.day >= safeSelectedDay && d.day < safeSelectedDay + selectedRange);
  const rangeScore = Math.round(selectedDays.reduce((sum, item) => sum + item.score, 0) / Math.max(selectedDays.length, 1));
  const rangeStart = selectedDays[0]?.day || safeSelectedDay;
  const rangeEnd = selectedDays[selectedDays.length - 1]?.day || safeSelectedDay;
  const chartData = deriveSimpleChartData(day);
  const hourlyData = deriveHourlyWeather(day);
  const riskBarData = deriveRiskBars(day);
  const comparisonBarData = [
    { label: "Heat", value: Math.round(clamp(day.temp * 3.2, 0, 100)), color: "bg-rose-500" },
    { label: "Humidity", value: day.humidity, color: "bg-sky-600" },
    { label: "Wind", value: Math.round(clamp(day.wind * 2.5, 0, 100)), color: "bg-violet-600" },
    { label: "Rain", value: day.rain, color: "bg-cyan-600" },
  ];

  const handleReset = () => {
    setLocationId("melbourne");
    setSelectedDay(5);
    setSelectedRange(3);
    setEventType("Marathon");
    setSearch("");
    setSelectedSuburb("Melbourne CBD");
  };

  const exportSummary = () => {
    const summary = `${selectedSuburb} from ${rangeStart} to ${rangeEnd} Sep 2025 is rated ${day.label} with an average suitability score of ${rangeScore}. Recommended start time is ${day.recommendedStart}.`;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marathon-weather-summary-${currentLocation.id}-day-${day.day}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(224,242,254,0.9),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_42%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#334155_100%)] shadow-[0_18px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-5 px-5 py-5 text-white lg:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <CloudSun className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Marathon Weather Planning Dashboard</div>
                <h1 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">Simple decision support for marathon organizers</h1>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <Card title="Choose location" subtitle="Keep the map first so organizers can start by choosing the city or suburb." icon={MapPin}>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full lg:max-w-sm">
                <span className="sr-only">Search for city or suburb</span>
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city or suburb"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-600 focus-visible:ring-2 focus-visible:ring-sky-600"
                  aria-label="Search city or suburb"
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1.5 block font-semibold text-slate-700">Event type</span>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
                  {Object.keys(eventAdjustments).map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
            </div>
            <AustraliaMap
              selectedId={locationId}
              onSelect={(id) => {
                setLocationId(id);
                const nextLocation = locations.find((loc) => loc.id === id);
                if (nextLocation?.drilldown?.length) {
                  setSelectedSuburb(nextLocation.drilldown[0]);
                }
              }}
              locations={activeFilteredLocations}
              selectedSuburb={selectedSuburb}
              onSelectSuburb={setSelectedSuburb}
            />
          </Card>

          <Card title="Date suitability calendar" subtitle="Keep the calendar beside the map so the main task flow stays simple." icon={CalendarDays}>
            <CalendarGrid
              selectedDay={safeSelectedDay}
              days={calendarDays}
              onSelectDay={setSelectedDay}
              selectedRange={selectedRange}
              onSelectRange={setSelectedRange}
            />
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.74fr_1.26fr]">
          <Card title="Recommendation" subtitle="A short summary for the selected date and location." icon={ShieldCheck}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected location</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{selectedSuburb}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{currentLocation.summary}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryMetric icon={CalendarDays} label="Date range" value={`${rangeStart}–${rangeEnd} Sep 2025`} />
                <SummaryMetric icon={Clock3} label="Start time" value={day.recommendedStart} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`border ${riskConfig[day.label].chip}`}>{day.label}</Badge>
                <Badge className="border border-slate-200 bg-slate-50 text-slate-700">Confidence: {currentLocation.confidence}</Badge>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#334155_100%)] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Finalized event summary</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryMetric icon={MapPin} label="Location" value={selectedSuburb} dark />
                  <SummaryMetric icon={Gauge} label="Score" value={`${rangeScore}/100`} dark />
                  <SummaryMetric icon={Clock3} label="Start" value={day.recommendedStart} dark />
                  <SummaryMetric icon={ShieldCheck} label="Risk" value={day.label} dark />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset filters
                </button>
                <button type="button" onClick={exportSummary} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export summary
                </button>
              </div>
            </div>
          </Card>

          <Card title="Weather overview" subtitle="Three simple charts keep the dashboard analytical, but still easy for non-technical users to read." icon={BarChart3}>
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">1. Weather metrics</div>
                <SimpleWeatherChart data={chartData} />
              </div>
              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">2. Morning temperature trend</div>
                <TemperatureLineChart data={hourlyData} />
              </div>
              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">3. Weather risk levels</div>
                <RiskLevelChart data={riskBarData} />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
