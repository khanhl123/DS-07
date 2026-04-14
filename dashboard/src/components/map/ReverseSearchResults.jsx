import { Trophy } from "lucide-react";
import {
  rankStationsForMonth,
  getSuitabilityColor,
  MONTH_NAMES_LONG,
} from "../../data/placeholderData";

export default function ReverseSearchResults({
  monthIndex,
  thresholds,
  onSelectStation,
}) {
  if (monthIndex == null) return null;
  const top = rankStationsForMonth(monthIndex, thresholds, 5);
  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-3"
      style={{
        background: "var(--primary-lightest)",
        border: "1px solid var(--primary-border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div
        className="inline-flex items-center gap-2 text-xs font-semibold"
        style={{ color: "#085041" }}
      >
        <Trophy className="h-4 w-4" aria-hidden="true" />
        Best historical matches for {MONTH_NAMES_LONG[monthIndex]}:
      </div>
      {top.map((row, i) => (
        <button
          key={row.station.n}
          type="button"
          onClick={() => onSelectStation(row.station.n)}
          className="inline-flex items-center gap-2 px-2.5 py-1 text-xs"
          style={{
            background: "#fff",
            border: "1px solid var(--primary-border)",
            borderRadius: "var(--radius)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "var(--primary)",
            }}
          >
            #{i + 1}
          </span>
          <span>{row.station.name}</span>
          <span style={{ color: "var(--text-secondary)" }}>
            {row.station.state}
          </span>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: getSuitabilityColor(row.score),
            }}
          />
          <span style={{ fontWeight: 700 }}>{row.score}</span>
        </button>
      ))}
    </div>
  );
}
