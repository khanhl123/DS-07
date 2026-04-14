import { Info, AlertTriangle } from "lucide-react";

export default function CoverageHints() {
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
          Data coverage: <strong>VIC (44)</strong>, <strong>NSW (26)</strong>,{" "}
          <strong>TAS (47)</strong>, <strong>NT (63)</strong> stations. Click a dot
          to explore. Zoom into VIC to separate clustered stations.
        </p>
      </div>
      <div
        className="flex items-start gap-2 px-3 py-2 text-xs"
        style={{
          background: "#FDF3D8",
          border: "1px solid #E8C674",
          borderRadius: "var(--radius)",
          color: "#6E4A05",
        }}
      >
        <AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>
          QLD, SA, WA, and ACT stations are not available in the current dataset.
        </p>
      </div>
    </div>
  );
}
