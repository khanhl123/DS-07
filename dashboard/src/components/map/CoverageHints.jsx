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
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-[11px]"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Marker legend"
      >
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Markers (by data completeness):
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#59C459",
              border: "1.5px solid #fff",
              boxShadow: "0 0 0 0.5px #999",
            }}
          />
          Green = full data (all 4 attributes)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#EFA827",
              border: "1.5px solid #fff",
              boxShadow: "0 0 0 0.5px #999",
            }}
          />
          Orange = partial data (2–3 of 4 attributes)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#D8D5CB",
              border: "1.5px solid #fff",
              boxShadow: "0 0 0 0.5px #999",
            }}
          />
          Grey = severely incomplete (0–1 of 4 attributes)
        </span>
      </div>
    </div>
  );
}
