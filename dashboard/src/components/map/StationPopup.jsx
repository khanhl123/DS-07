import { synthesiseStationDaily, summariseMonthly } from "../../data/useStationDaily";
import {
  computeAdjustedScore,
  getSuitabilityColor,
  getSuitabilityLabel,
  MONTHS,
} from "../../data/placeholderData";

export default function StationPopup({ station, monthIndex, thresholds, onSelect }) {
  const daily = synthesiseStationDaily(station, monthIndex);
  const summary = summariseMonthly(daily);
  const score = computeAdjustedScore(
    station.monthlyScores[monthIndex],
    thresholds,
  );
  const color = getSuitabilityColor(score);
  const label = getSuitabilityLabel(score);

  return (
    <div style={{ minWidth: 200, fontFamily: "inherit" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
        {station.name}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>
        {station.state} · Station #{station.n} · {MONTHS[monthIndex]}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          fontSize: 11,
          marginBottom: 8,
        }}
      >
        <div>Max: <strong>{summary.maxTemp}°C</strong></div>
        <div>Min: <strong>{summary.minTemp}°C</strong></div>
        <div>Rain: <strong>{summary.rainfall}mm</strong></div>
        <div>UV: <strong>{summary.uvIndex}</strong></div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: color,
          }}
        />
        <span style={{ fontSize: 11, color: "var(--text-primary)" }}>
          Score <strong>{score}</strong> — {label}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          onSelect?.();
          const el = document.getElementById("when");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        style={{
          width: "100%",
          padding: "6px 10px",
          background: "var(--primary)",
          color: "#fff",
          border: 0,
          borderRadius: "var(--radius)",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        View full analysis →
      </button>
    </div>
  );
}
