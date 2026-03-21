import { useEffect, useMemo, useRef, useState } from "react";
import { suitabilityConfig } from "../../data/placeholderData";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const suitabilityIcons = { suitable: CheckCircle2, slightly_suitable: AlertTriangle, not_suitable: XCircle };

export default function SuitabilityCalendar({ dailyData, selectedDay, onSelectDay, selectedMonth, selectedYear }) {
  const [hoveredPreview, setHoveredPreview] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dailyMap = {};
  dailyData.forEach((day) => { dailyMap[day.day] = day; });

  useEffect(() => {
    const stopDrag = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, []);

  const normalizedRange = useMemo(() => {
    if (rangeStart === null || rangeEnd === null) return null;
    return [Math.min(rangeStart, rangeEnd), Math.max(rangeStart, rangeEnd)];
  }, [rangeEnd, rangeStart]);

  const rangeSummary = useMemo(() => {
    if (!normalizedRange) return null;
    const [start, end] = normalizedRange;
    const selectedDays = dailyData.filter((day) => day.day >= start && day.day <= end);
    if (!selectedDays.length) return null;

    const averageScore = Math.round(selectedDays.reduce((sum, day) => sum + day.score, 0) / selectedDays.length);
    return { count: selectedDays.length, averageScore };
  }, [dailyData, normalizedRange]);

  const handleDayHover = (event, dayNumber, day) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const cellRect = event.currentTarget.getBoundingClientRect();

    if (containerRect && day) {
      setHoveredPreview({
        dayNumber,
        day,
        x: cellRect.left - containerRect.left + (cellRect.width / 2),
        y: cellRect.top - containerRect.top,
      });
    } else {
      setHoveredPreview(null);
    }

    if (isDragging) {
      setRangeEnd(dayNumber);
    }
  };

  return (
    <div className="relative space-y-3" ref={containerRef}>
      {hoveredPreview?.day && (
        <div
          className="pointer-events-none absolute z-20 w-48 -translate-x-1/2 -translate-y-full rounded-xl border border-[rgba(231,111,81,0.2)] bg-[rgba(255,249,243,0.98)] px-3 py-2 shadow-[0_16px_30px_rgba(56,43,31,0.12)]"
          style={{ left: hoveredPreview.x, top: hoveredPreview.y - 8 }}
          aria-hidden="true"
        >
          <div className="absolute inset-y-2 left-1 w-1 rounded-full" style={{ backgroundColor: suitabilityConfig[hoveredPreview.day.suitability]?.hex || "#e9c46a" }} />
          <p className="pl-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8f5438]">
            Day {hoveredPreview.dayNumber} Snapshot
          </p>
          <div className="mt-1 space-y-1 pl-2 text-[11px] text-[#6f5b4d]">
            <p>Temp {hoveredPreview.day.temp}{"\u00b0C"}</p>
            <p>Humidity {hoveredPreview.day.humidity}%</p>
            <p>Wind {hoveredPreview.day.wind} km/h</p>
            <p>UV {hoveredPreview.day.uv}</p>
            <p className="font-semibold text-[#8f5438]">Score {hoveredPreview.day.score}/100</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#725c4b]">
          {monthNames[selectedMonth - 1]} {selectedYear}
        </h4>
        <div className="flex items-center gap-3" aria-label="Calendar legend">
          {Object.entries(suitabilityConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-[#766455]">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} aria-hidden="true" />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--marathon-line)] bg-[rgba(255,249,243,0.98)] shadow-[0_16px_28px_rgba(61,46,33,0.06)]">
        <div className="grid grid-cols-7 border-b border-[rgba(217,204,191,0.7)] bg-[#f2e6d9]">
          {dayNames.map((dayName) => (
            <div key={dayName} className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8d7563]">
              {dayName}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`pad-${index}`} className="min-h-[78px] border-b border-r border-[rgba(217,204,191,0.55)] bg-[#faf3ec]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1;
            const day = dailyMap[dayNumber];
            const suitability = day?.suitability || "slightly_suitable";
            const cfg = suitabilityConfig[suitability];
            const Icon = suitabilityIcons[suitability];
            const isSelected = selectedDay === dayNumber;
            const isInRange = normalizedRange
              ? dayNumber >= normalizedRange[0] && dayNumber <= normalizedRange[1]
              : false;

            return (
              <button
                key={dayNumber}
                type="button"
                onClick={() => onSelectDay(dayNumber)}
                onMouseDown={() => {
                  setRangeStart(dayNumber);
                  setRangeEnd(dayNumber);
                  setIsDragging(true);
                  onSelectDay(dayNumber);
                }}
                onMouseEnter={(event) => handleDayHover(event, dayNumber, day)}
                onMouseLeave={() => setHoveredPreview((current) => (current?.dayNumber === dayNumber ? null : current))}
                onMouseUp={() => {
                  setRangeEnd(dayNumber);
                  setIsDragging(false);
                  onSelectDay(dayNumber);
                }}
                className={`relative min-h-[78px] border-b border-r border-[rgba(217,204,191,0.55)] p-1.5 text-left transition hover:bg-[#fff4ea] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--marathon-accent)] ${
                  isSelected ? "ring-2 ring-inset ring-[var(--marathon-accent)] bg-[#fff1eb]" : ""
                } ${isInRange ? "bg-[rgba(231,111,81,0.08)]" : ""}`}
                aria-label={`Day ${dayNumber}, ${cfg.label}, score ${day?.score || "N/A"}`}
                aria-pressed={isSelected}
              >
                {isInRange && (
                  <span className="pointer-events-none absolute inset-x-1 bottom-1 top-7 rounded-lg bg-[linear-gradient(180deg,rgba(231,111,81,0.12),rgba(231,111,81,0.04))]" aria-hidden="true" />
                )}
                <div className="relative z-10 flex items-start justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? "text-[#9b422d]" : "text-[#52453b]"}`}>
                    {dayNumber}
                  </span>
                  <Icon className={`h-3 w-3 ${cfg.textColor}`} aria-hidden="true" />
                </div>
                {day && (
                  <div className="relative z-10">
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#eadfd2]">
                      <div className={`h-1.5 rounded-full ${cfg.color}`} style={{ width: `${day.score}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-[#8d7768]">{day.score}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {rangeSummary && rangeSummary.count > 1 && (
        <div className="rounded-xl border border-[rgba(231,111,81,0.18)] bg-[rgba(255,249,243,0.94)] px-3 py-2 text-sm text-[#6f5b4d] shadow-[0_10px_24px_rgba(61,46,33,0.05)]">
          <span className="font-semibold uppercase tracking-[0.14em] text-[#8f5438]">Selected Window</span>
          <span className="ml-2">{rangeSummary.count} days</span>
          <span className="ml-3 font-medium text-[#9b422d]">Average score {rangeSummary.averageScore}/100</span>
        </div>
      )}
    </div>
  );
}
