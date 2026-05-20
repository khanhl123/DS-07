import { Info } from "lucide-react";
import { stationCountsByState } from "../../data/placeholderData";

export default function CoverageHints() {
  const entries = Object.entries(stationCountsByState).sort(
    (a, b) => b[1] - a[1],
  );
  const total = entries.reduce((acc, [, n]) => acc + n, 0);

  return (
    <div className="grid gap-2">
      <div
        className="flex items-start gap-2 px-3 py-2 text-xs"
        style={{
          background: "var(--primary-lightest)",
          border: "1px solid var(--primary-border)",
          borderRadius: "var(--radius)",
          color: "#0a5a46",
        }}
      >
        <Info className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>
          Data coverage ({total} stations):{" "}
          {entries.map(([code, n], i) => (
            <span key={code}>
              <strong>
                {code} ({n})
              </strong>
              {i < entries.length - 1 ? ", " : ""}
            </span>
          ))}
          . Click a dot to explore. Zoom in to separate clustered stations.
        </p>
      </div>
    </div>
  );
}
