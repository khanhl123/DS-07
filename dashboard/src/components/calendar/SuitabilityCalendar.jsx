import {
  EXPERT_VERDICT_COLORS,
  EXPERT_VERDICT_LABELS,
  suitabilityConfig,
} from "../../data/placeholderData";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const suitIcons = { suitable: CheckCircle2, mixed: AlertTriangle, not_suitable: XCircle };

export default function SuitabilityCalendar({ dailyData, selectedDay, onSelectDay, selectedMonth, selectedYear, isPredicted = false }) {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const dailyMap = {};
  dailyData.forEach((d) => { dailyMap[d.day] = d; });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--text)]">
          {monthNames[selectedMonth - 1]} {selectedYear}
          {isPredicted && (
            <span
              title="NN-predicted weather, not a recorded observation"
              style={{
                marginLeft: 8,
                padding: "1px 6px",
                fontSize: 9,
                background: "var(--primary)",
                color: "#fff",
                borderRadius: 4,
                fontWeight: 700,
                letterSpacing: "0.04em",
                verticalAlign: "middle",
              }}
            >
              PREDICTED
            </span>
          )}
        </h4>
        <div className="flex items-center gap-3" aria-label="Legend">
          {Object.entries(suitabilityConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-secondary)]">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} /> {cfg.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-alt)]">
          {dayNames.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[72px] border-b border-r border-[var(--border)] bg-[var(--bg)]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayData = dailyMap[dayNum];
            const suit = dayData?.suitability || "mixed";
            const cfg = suitabilityConfig[suit];
            const Icon = suitIcons[suit];
            const isSelected = selectedDay === dayNum;
            return (
              <button
                key={dayNum} type="button" onClick={() => onSelectDay(dayNum)}
                className={`relative min-h-[72px] border-b border-r border-[var(--border)] p-1.5 text-left transition hover:bg-blue-50/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-blue)] ${
                  isSelected ? "ring-2 ring-inset ring-[var(--accent-blue)] bg-blue-50/60" : ""
                }`}
                aria-label={`Day ${dayNum}, ${cfg.label}, score ${dayData?.score || "N/A"}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? "text-[var(--accent-blue)]" : "text-[var(--text)]"}`}>{dayNum}</span>
                  <div className="flex items-center gap-1">
                    {dayData?.marathonVerdict && (
                      <span
                        title={`Expert verdict: ${EXPERT_VERDICT_LABELS[dayData.marathonVerdict.colour]} (${dayData.marathonVerdict.score})`}
                        aria-label={`Expert verdict ${EXPERT_VERDICT_LABELS[dayData.marathonVerdict.colour]}`}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: EXPERT_VERDICT_COLORS[dayData.marathonVerdict.colour],
                          display: "inline-block",
                        }}
                      />
                    )}
                    <Icon className={`h-3 w-3 ${cfg.textColor}`} aria-hidden="true" />
                  </div>
                </div>
                {dayData && (
                  <>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--surface-alt)]">
                      <div className={`h-1.5 rounded-full ${cfg.color}`} style={{ width: `${dayData.score}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">{dayData.score}</div>
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
