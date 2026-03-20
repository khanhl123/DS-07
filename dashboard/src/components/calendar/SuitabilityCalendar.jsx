import { suitabilityConfig } from "../../data/placeholderData";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const suitabilityIcons = { suitable: CheckCircle2, slightly_suitable: AlertTriangle, not_suitable: XCircle };

export default function SuitabilityCalendar({ dailyData, selectedDay, onSelectDay, selectedMonth, selectedYear }) {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const dailyMap = {};
  dailyData.forEach((d) => { dailyMap[d.day] = d; });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">
          {monthNames[selectedMonth - 1]} {selectedYear}
        </h4>
        <div className="flex items-center gap-3" aria-label="Calendar legend">
          {Object.entries(suitabilityConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} aria-hidden="true" />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {dayNames.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[72px] border-b border-r border-slate-100 bg-slate-50/50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayData = dailyMap[dayNum];
            const suitability = dayData?.suitability || "slightly_suitable";
            const cfg = suitabilityConfig[suitability];
            const Icon = suitabilityIcons[suitability];
            const isSelected = selectedDay === dayNum;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => onSelectDay(dayNum)}
                className={`relative min-h-[72px] border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${
                  isSelected ? "ring-2 ring-inset ring-sky-500 bg-sky-50/50" : ""
                }`}
                aria-label={`Day ${dayNum}, ${cfg.label}, score ${dayData?.score || "N/A"}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? "text-sky-700" : "text-slate-700"}`}>
                    {dayNum}
                  </span>
                  <Icon className={`h-3 w-3 ${cfg.textColor}`} aria-hidden="true" />
                </div>
                {dayData && (
                  <>
                    <div className={`mt-2 h-1.5 w-full rounded-full bg-slate-100`}>
                      <div className={`h-1.5 rounded-full ${cfg.color}`} style={{ width: `${dayData.score}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-slate-500">{dayData.score}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
