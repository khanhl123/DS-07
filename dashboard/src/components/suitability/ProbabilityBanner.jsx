import { useMemo } from "react";
import { Info } from "lucide-react";
import { MONTH_NAMES_LONG } from "../../data/placeholderData";

export default function ProbabilityBanner({ dailyData, thresholds, monthIndex, isPredicted = false }) {
  const pct = useMemo(() => {
    if (!dailyData?.length) return 0;
    const good = dailyData.filter(
      (d) =>
        d.maxTemp <= thresholds.maxTemp &&
        d.minTemp >= thresholds.minTemp &&
        d.rainfall <= thresholds.rainfall &&
        d.uvIndex <= thresholds.uv,
    ).length;
    return Math.round((good / dailyData.length) * 100);
  }, [dailyData, thresholds]);

  return (
    <div
      className="flex items-center gap-4 p-4"
      style={{
        background: "var(--primary-lightest)",
        border: "1px solid var(--primary-border)",
        borderRadius: "var(--radius)",
      }}
    >
      <span
        className="text-4xl font-bold tabular-nums"
        style={{ color: "var(--primary)" }}
      >
        {pct}%
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            of {isPredicted ? "NN-predicted" : "historical"}{" "}
            {MONTH_NAMES_LONG[monthIndex]} days at this station had{" "}
            <strong>suitable conditions</strong> based on your thresholds.
          </p>
          <span className="relative inline-flex group">
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center"
              style={{
                border: "1px solid var(--primary-border)",
                borderRadius: 999,
                color: "var(--primary)",
                background: "#fff",
              }}
              aria-label="How this percentage differs from the calendar"
              aria-describedby="probability-scoring-note"
            >
              <Info className="h-3 w-3" aria-hidden="true" />
            </button>
            <span
              id="probability-scoring-note"
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 p-2 text-[11px] shadow-lg group-hover:block group-focus-within:block"
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-secondary)",
              }}
            >
              This banner counts only days that meet every threshold at once. The
              calendar uses a penalty score, so a day can still appear green if it
              is close to your thresholds.
            </span>
          </span>
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Recalculates when you adjust thresholds above.{" "}
          {isPredicted
            ? "Based on NN-predicted weather; uncertainty is higher than historical estimates."
            : "Based on historical observations only, not a forecast."}
        </p>
      </div>
    </div>
  );
}
