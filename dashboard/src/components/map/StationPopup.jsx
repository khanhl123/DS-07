import { useEffect, useState } from "react";
import {
  computeAdjustedScore,
  getSuitabilityColor,
  getSuitabilityLabel,
  MONTHS,
} from "../../data/placeholderData";
import { summariseMonthly } from "../../data/useStationDaily";

export default function StationPopup({ station, monthIndex, year, thresholds, onSelect }) {
  const score = computeAdjustedScore(
    station.monthlyScores[monthIndex],
    thresholds,
  );
  const color = getSuitabilityColor(score);
  const label = getSuitabilityLabel(score);

  const [cached, setCached] = useState({ key: null, value: null });
  const cacheKey = `${station.n}|${monthIndex}|${year}`;

  useEffect(() => {
    let cancelled = false;
    const n = Number.parseInt(station.n, 10);
    fetch(`/api/stations/${n}/daily?year=${year}&month=${monthIndex + 1}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!cancelled) setCached({ key: cacheKey, value: summariseMonthly(rows) });
      })
      .catch(() => {
        if (!cancelled) setCached({ key: cacheKey, value: null });
      });
    return () => { cancelled = true; };
  }, [station, monthIndex, year, cacheKey]);

  // Show Loading until the cached result matches the current station/month.
  const summary = cached.key === cacheKey ? cached.value : null;

  return (
    <div style={{ minWidth: 200, fontFamily: "inherit" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
        {station.name}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>
        {station.state} · Station #{station.n} · {MONTHS[monthIndex]} {year}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          fontSize: 11,
          marginBottom: 8,
          minHeight: 48,
          color: "var(--text-primary)",
        }}
      >
        {summary ? (
          <>
            <div>Max: <strong>{summary.maxTemp}°C</strong></div>
            <div>Min: <strong>{summary.minTemp}°C</strong></div>
            <div>Rain: <strong>{summary.rainfall}mm</strong></div>
            <div>
              UV<span style={{ fontSize: 9, color: "var(--text-muted)" }}>*</span>:{" "}
              <strong>{summary.uvIndex}</strong>
            </div>
          </>
        ) : (
          <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)" }}>
            Loading…
          </div>
        )}
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
