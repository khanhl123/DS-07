import { Play, Pause } from "lucide-react";
import { MONTHS } from "../../data/placeholderData";

export default function MapToolbar({
  isAnimating,
  onToggleAnimate,
  selectedMonthIndex,
  selectedYear,
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
        {MONTHS[selectedMonthIndex]} {selectedYear}
      </div>
    </div>
  );
}
