import { useMemo } from "react";
import { computeAdjustedScore, MONTHS } from "../../data/placeholderData";

function bandForScore(score) {
  if (score >= 80) return { bg: "#2D9C56", text: "#fff" };
  if (score >= 65) return { bg: "#59C459", text: "#1e3d1f" };
  if (score >= 40) return { bg: "#EFA827", text: "#3f2c08" };
  return { bg: "#E24B4A", text: "#fff" };
}

export default function MonthStrip({
  station,
  thresholds,
  selectedMonthIndex,
  onSelectMonth,
  onStopAnimation,
}) {
  const scores = useMemo(() => {
    if (!station) return MONTHS.map(() => 50);
    return station.monthlyScores.map((s) =>
      computeAdjustedScore(s, thresholds),
    );
  }, [station, thresholds]);

  return (
    <div
      className="p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h4
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Best month to host — {station?.name ?? "—"}
        </h4>
        <span
          className="text-[11px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Click any month to jump there
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1.5">
        {MONTHS.map((m, i) => {
          const band = bandForScore(scores[i]);
          const isSelected = i === selectedMonthIndex;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                onStopAnimation?.();
                onSelectMonth(i);
              }}
              className="flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold"
              style={{
                background: band.bg,
                color: band.text,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                border: "0",
                boxShadow: isSelected ? "0 0 0 2px var(--primary)" : "none",
                transition: "background 0.3s ease",
              }}
              aria-label={`${m}: score ${scores[i]}${isSelected ? " (selected)" : ""}`}
              aria-current={isSelected ? "true" : undefined}
            >
              <span>{m}</span>
              <span className="tabular-nums">{scores[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
