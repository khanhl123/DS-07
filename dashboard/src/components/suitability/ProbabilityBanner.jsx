import { useMemo } from "react";
import { MONTH_NAMES_LONG } from "../../data/placeholderData";

export default function ProbabilityBanner({ dailyData, thresholds, monthIndex }) {
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
      <div>
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
          of historical {MONTH_NAMES_LONG[monthIndex]} days at this station had{" "}
          <strong>suitable conditions</strong> based on your thresholds.
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Recalculates when you adjust thresholds above.
        </p>
      </div>
    </div>
  );
}
