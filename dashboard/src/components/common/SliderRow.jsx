import { useId } from "react";

export default function SliderRow({
  label,
  unit = "",
  min,
  max,
  step = 1,
  value,
  onChange,
  comparator = "≤",
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {label}{" "}
          <span style={{ color: "var(--text-secondary)" }}>({comparator})</span>
        </label>
        <span
          className="text-xs tabular-nums"
          style={{ color: "var(--primary)" }}
        >
          <strong>{value}</strong>
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="themed"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`${label} threshold (${comparator} ${value}${unit})`}
      />
    </div>
  );
}
