import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--primary-border)",
        overflow: "hidden",
      }}
    >
      {/* ── Panel header ── */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{
          background: "var(--primary-lightest)",
          borderBottom: "1px solid var(--primary-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="h-4 w-4"
            aria-hidden="true"
            style={{ color: "var(--primary)" }}
          />
          <div>
            <span
              className="text-sm font-bold"
              style={{
                fontFamily: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-primary)",
              }}
            >
              Adjust thresholds
            </span>
            <p
              className="text-[11px] leading-tight"
              style={{ color: "var(--text-secondary)" }}
            >
              Set your weather limits — the map and score update instantly.
            </p>
            <p
              className="text-[10px] leading-tight mt-0.5"
              style={{ color: "var(--text-muted)", fontStyle: "italic" }}
            >
              Map colours use a fast linear approximation around the defaults;
              the per-station detail view uses exact daily data. Calendar dots
              and popup badges show an independent expert verdict based on
              marathon-running research.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          style={{
            border: "1px solid var(--primary-border)",
            borderRadius: "var(--radius)",
            background: "#fff",
            color: "var(--text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <RotateCcw className="h-3 w-3" />
          Reset to defaults
        </button>
      </div>

      {/* ── Sliders + live score ── */}
      <div className="grid gap-4 p-4 md:grid-cols-[2fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <SliderRow
            label="Max temp"
            unit="°C"
            min={12}
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
            max={16}
            step={1}
            value={thresholds.minTemp}
            comparator="≥"
            onChange={(v) => updated({ minTemp: v })}
          />
          <SliderRow
            label="Rainfall"
            unit="mm"
            min={0}
            max={8}
            step={1}
            value={thresholds.rainfall}
            comparator="≤"
            onChange={(v) => updated({ rainfall: v })}
          />
          <SliderRow
            label="UV index"
            min={0}
            max={12}
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
        </div>
      </div>
    </div>
  );
}
