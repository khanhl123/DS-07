import { useState } from "react";
import { X, ChevronsUp, ChevronsDown } from "lucide-react";
import {
  computeAdjustedScore,
  getSuitabilityColor,
  stationsByNumber,
  MONTHS,
} from "../../data/placeholderData";

export default function StickyComparisonTray({
  comparedStationNumbers,
  primaryStationNumber,
  selectedMonthIndex,
  thresholds,
  onRemove,
  onSelectPrimary,
}) {
  const [expanded, setExpanded] = useState(false);

  const rows = comparedStationNumbers
    .map((n) => stationsByNumber[n])
    .filter(Boolean)
    .map((s) => ({
      station: s,
      score: computeAdjustedScore(
        s.monthlyScores[selectedMonthIndex],
        thresholds,
      ),
    }));

  return (
    <div className="sticky-tray" role="region" aria-label="Station comparison tray">
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <span
            className="shrink-0 text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Comparing for {MONTHS[selectedMonthIndex]}:
          </span>
          <div className="flex flex-1 flex-wrap gap-2">
            {rows.length === 0 && (
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Click a station on the map to compare.
              </span>
            )}
            {rows.map(({ station, score }) => {
              const isPrimary = station.n === primaryStationNumber;
              return (
                <span
                  key={station.n}
                  className="inline-flex items-center gap-2 px-2.5 py-1 text-xs"
                  style={{
                    background: isPrimary ? "var(--primary-lightest)" : "#fff",
                    border: isPrimary
                      ? "1px solid var(--primary-border)"
                      : "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: getSuitabilityColor(score),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onSelectPrimary(station.n)}
                    className="font-medium"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {station.name}
                  </button>
                  <span className="tabular-nums font-semibold">{score}</span>
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => onRemove(station.n)}
                      aria-label={`Remove ${station.name} from comparison`}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 0,
                        display: "inline-flex",
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "#fff",
              border: "1px solid var(--primary-border)",
              borderRadius: "var(--radius)",
              color: "var(--primary)",
              cursor: "pointer",
            }}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronsDown className="h-3.5 w-3.5" /> : <ChevronsUp className="h-3.5 w-3.5" />}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {expanded && rows.length > 0 && (
          <div
            className="mt-3 overflow-x-auto"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              padding: 12,
            }}
          >
            <table className="w-full text-xs" style={{ color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ color: "var(--text-secondary)" }}>
                  <th className="text-left py-1 pr-4">Station</th>
                  <th className="text-left py-1 pr-4">State</th>
                  <th className="text-right py-1 pr-4">Adj. score</th>
                  <th className="text-right py-1 pr-4">Base (month)</th>
                  <th className="text-right py-1">Lat, Lng</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ station, score }) => (
                  <tr key={station.n} style={{ borderTop: "1px solid var(--border-light)" }}>
                    <td className="py-1 pr-4 font-semibold">{station.name}</td>
                    <td className="py-1 pr-4">{station.state}</td>
                    <td className="py-1 pr-4 text-right tabular-nums">
                      <span style={{ color: getSuitabilityColor(score), fontWeight: 700 }}>
                        {score}
                      </span>
                    </td>
                    <td className="py-1 pr-4 text-right tabular-nums">
                      {station.monthlyScores[selectedMonthIndex]}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {station.lat.toFixed(2)}, {station.lng.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
