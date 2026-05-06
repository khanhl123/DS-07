import { Play, Pause, Target } from "lucide-react";
import { MONTHS, MONTH_NAMES_LONG } from "../../data/placeholderData";

export default function MapToolbar({
  isAnimating,
  onToggleAnimate,
  selectedMonthIndex,
  reverseSearchMonth,
  onReverseSearchChange,
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-3"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
      }}
    >
      <button
        type="button"
        onClick={onToggleAnimate}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
        style={{
          background: isAnimating ? "var(--primary)" : "#fff",
          color: isAnimating ? "#fff" : "var(--primary)",
          border: "1px solid var(--primary-border)",
          borderRadius: "var(--radius)",
          cursor: "pointer",
        }}
        aria-pressed={isAnimating}
      >
        {isAnimating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {isAnimating ? "Pause" : "Play months"}
      </button>

      <div
        className="text-sm font-semibold tabular-nums"
        style={{ color: "var(--text-primary)" }}
        aria-live="polite"
      >
        {MONTHS[selectedMonthIndex]}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <label
          className="inline-flex items-center gap-2 text-xs font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          <Target className="h-3.5 w-3.5" aria-hidden="true" />
          Find best for:
          <select
            value={reverseSearchMonth ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onReverseSearchChange(v === "" ? null : Number(v));
            }}
            style={{
              padding: "4px 8px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "#fff",
              fontSize: 12,
              color: "var(--text-primary)",
            }}
          >
            <option value="">— none —</option>
            {MONTH_NAMES_LONG.map((n, i) => (
              <option key={i} value={i}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
