import { RotateCcw } from "lucide-react";
import SliderRow from "../common/SliderRow";
import {
  DEFAULT_THRESHOLDS,
  computeAdjustedScore,
  getSuitabilityColor,
  getSuitabilityLabel,
  MONTHS,
} from "../../data/placeholderData";

export default function ThresholdPanel({
  thresholds,
  onChange,
  selectedStation,
  selectedMonthIndex,
}) {
  const updated = (patch) => onChange({ ...thresholds, ...patch });
  const reset = () => onChange({ ...DEFAULT_THRESHOLDS });

  const liveScore = selectedStation
    ? computeAdjustedScore(
        selectedStation.monthlyScores[selectedMonthIndex],
        thresholds,
      )
    : null;
  const liveColor = liveScore != null ? getSuitabilityColor(liveScore) : "#888";
  const liveLabel = liveScore != null ? getSuitabilityLabel(liveScore) : "";

  return (
    <div
      className="grid gap-4 p-4 md:grid-cols-[2fr_1fr]"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--primary-border)",
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <SliderRow
          label="Max temp"
          unit="°C"
          min={20}
          max={40}
          step={1}
          value={thresholds.maxTemp}
          comparator="≤"
          onChange={(v) => updated({ maxTemp: v })}
        />
        <SliderRow
          label="Min temp"
          unit="°C"
          min={0}
          max={20}
          step={1}
          value={thresholds.minTemp}
          comparator="≥"
          onChange={(v) => updated({ minTemp: v })}
        />
        <SliderRow
          label="Rainfall"
          unit="mm"
          min={0}
          max={20}
          step={1}
          value={thresholds.rainfall}
          comparator="≤"
          onChange={(v) => updated({ rainfall: v })}
        />
        <SliderRow
          label="UV index"
          min={3}
          max={14}
          step={1}
          value={thresholds.uv}
          comparator="≤"
          onChange={(v) => updated({ uv: v })}
        />
      </div>

      <div
        className="flex flex-col justify-between gap-3 p-3"
        style={{
          background: "var(--card-bg)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            className="text-[10px] uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Live score — {selectedStation?.name ?? "—"} · {MONTHS[selectedMonthIndex]}
          </div>
          {liveScore != null && (
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: liveColor }}
              >
                {liveScore}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                / 100 — <strong>{liveLabel}</strong> with your thresholds
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold"
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "#fff",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
