import { RotateCcw } from "lucide-react";
import { DEFAULT_THRESHOLDS } from "../../utils/suitabilityScore";
import { THRESHOLD_RANGES } from "../../utils/personalThresholds";

const KEYS = ["maxTemp", "minTemp", "rainfall", "uvIndex"];

function formatValue(key, value) {
  const { unit, step } = THRESHOLD_RANGES[key];
  const display = step < 1 ? value.toFixed(1) : value;
  return `${display}${unit}`;
}

export default function ThresholdPanel({
  thresholds,
  onChange,
  verdict,
  stationName,
  monthLabel,
}) {
  const isAtDefaults = KEYS.every((k) => thresholds[k] === DEFAULT_THRESHOLDS[k]);

  return (
    <div
      className="mb-4 p-4"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
      }}
      role="region"
      aria-label="Personal threshold filter"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Adjust Thresholds
          </h3>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Set your weather limits — the score below (and the big Step 3
            score) = this station/month's climatology ceiling times the
            share of days meeting all four cut-offs. Loosen sliders to climb
            back toward the climatology; tighten to drop below it. The map,
            month strip, calendar dots, and station popups still show the
            independent expert verdict for actual recorded weather.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_THRESHOLDS)}
          disabled={isAtDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: isAtDefaults ? "var(--text-muted)" : "var(--text-primary)",
            cursor: isAtDefaults ? "default" : "pointer",
            opacity: isAtDefaults ? 0.6 : 1,
          }}
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset to defaults
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_240px]">
        {KEYS.map((key) => {
          const range = THRESHOLD_RANGES[key];
          const value = thresholds[key];
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {range.label}
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatValue(key, value)}
                </span>
              </div>
              <input
                type="range"
                className="themed"
                min={range.min}
                max={range.max}
                step={range.step}
                value={value}
                onChange={(e) =>
                  onChange({ ...thresholds, [key]: Number(e.target.value) })
                }
                aria-label={`${range.label} ${range.unit}`.trim()}
                aria-valuemin={range.min}
                aria-valuemax={range.max}
                aria-valuenow={value}
              />
              <div
                className="flex justify-between text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                <span>
                  {range.min}
                  {range.unit}
                </span>
                <span>
                  {range.max}
                  {range.unit}
                </span>
              </div>
            </div>
          );
        })}

        <div
          className="flex flex-col items-center justify-center p-3"
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <span
            className="text-[10px] uppercase tracking-wider text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Live score — {stationName} — {monthLabel}
          </span>
          <div className="my-1 flex items-baseline gap-1">
            <span
              className="text-4xl font-bold tabular-nums"
              style={{
                color: verdict.colour,
                transition: "color 200ms ease",
              }}
            >
              {verdict.score == null ? "—" : verdict.score}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              /100
            </span>
          </div>
          <span
            className="text-center text-xs font-semibold"
            style={{ color: verdict.colour, transition: "color 200ms ease" }}
          >
            {verdict.statusLabel}
          </span>
          {verdict.total > 0 && (
            <span
              className="mt-1 text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {verdict.passed} / {verdict.total} days pass
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
