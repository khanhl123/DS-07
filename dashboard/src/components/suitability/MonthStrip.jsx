import {
  MONTHS,
  getSuitabilityColor,
  SCORE_NA_TEXT,
} from "../../data/placeholderData";

function bandStyle(score) {
  const bg = getSuitabilityColor(score);
  // Dark text on the lighter green/orange/missing bands for WCAG AA
  // contrast; white only on the red band where dark text is unreadable.
  let text;
  if (score == null) text = "var(--text-muted)";
  else if (score > 70) text = "#1e3d1f";
  else if (score > 40) text = "#3f2c08";
  else text = "#fff";
  return { bg, text };
}

export default function MonthStrip({
  station,
  selectedMonthIndex,
  onSelectMonth,
  onStopAnimation,
}) {
  const scores = station ? station.monthlyScores : MONTHS.map(() => null);

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
          Best month to host (long-term average) — {station?.name ?? "—"}
        </h4>
        <span
          className="text-[11px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Climatology across all years · click any month to jump there
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1.5">
        {MONTHS.map((m, i) => {
          const band = bandStyle(scores[i]);
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
              aria-label={`${m}: ${
                scores[i] == null ? SCORE_NA_TEXT : `score ${scores[i]}`
              }${isSelected ? " (selected)" : ""}`}
              aria-current={isSelected ? "true" : undefined}
            >
              <span>{m}</span>
              <span className="tabular-nums">{scores[i] ?? "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
