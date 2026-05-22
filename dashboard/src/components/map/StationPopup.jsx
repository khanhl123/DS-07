import { useEffect, useState } from "react";
import {
  getSuitabilityColor,
  getSuitabilityLabel,
  MONTHS,
  SCORE_COLORS,
  SCORE_NA_TEXT,
} from "../../data/placeholderData";

export default function StationPopup({ station, monthIndex, year, onSelect }) {
  // Hits the yearly endpoint so the monthly summary and the suitability
  // verdict are the same year-specific numbers the yearly chart shows.
  const [cached, setCached] = useState({ key: null, value: null });
  const cacheKey = `${station.n}|${monthIndex}|${year}`;

  useEffect(() => {
    let cancelled = false;
    const n = Number.parseInt(station.n, 10);
    fetch(`/api/stations/${n}/yearly?year=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((rows) => {
        if (!cancelled) {
          const month = rows?.find((m) => m.month === monthIndex) ?? null;
          setCached({ key: cacheKey, value: month });
        }
      })
      .catch(() => {
        if (!cancelled) setCached({ key: cacheKey, value: null });
      });
    return () => { cancelled = true; };
  }, [station, monthIndex, year, cacheKey]);

  // Three states: in-flight (key mismatch), error (key match, value null),
  // ok (key match, value present). Loading vs error must be distinguishable.
  const cacheHit = cached.key === cacheKey;
  const summary = cacheHit ? cached.value : null;
  const isError = cacheHit && cached.value === null;

  const verdictScore = summary?.marathonVerdict?.score;
  const verdictConfidence = summary?.marathonVerdict?.confidence;
  const hasVerdict = verdictScore != null;
  const isPartial = hasVerdict && verdictConfidence === "partial";
  const missingAttrs = summary
    ? [
        summary.maxTemp == null && "max temp",
        summary.minTemp == null && "min temp",
        summary.rainfall == null && "rainfall",
        summary.uvIndex == null && "UV",
      ].filter(Boolean)
    : [];

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
            <div>Max: <strong>{summary.maxTemp == null ? "—" : `${summary.maxTemp}°C`}</strong></div>
            <div>Min: <strong>{summary.minTemp == null ? "—" : `${summary.minTemp}°C`}</strong></div>
            <div>Rain: <strong>{summary.rainfall == null ? "—" : `${summary.rainfall}mm`}</strong></div>
            <div>
              UV<span style={{ fontSize: 9, color: "var(--text-muted)" }}>*</span>:{" "}
              <strong>{summary.uvIndex ?? "—"}</strong>
            </div>
          </>
        ) : isError ? (
          <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)" }}>
            Data unavailable
          </div>
        ) : (
          <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)" }}>
            Loading…
          </div>
        )}
      </div>
      {summary && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
          title={
            hasVerdict
              ? "Suitability based on the marathon-running research model"
              : SCORE_NA_TEXT
          }
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: hasVerdict
                ? getSuitabilityColor(verdictScore)
                : SCORE_COLORS.missing,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: hasVerdict ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            {hasVerdict ? (
              <>
                Suitability <strong>{verdictScore}</strong> —{" "}
                {getSuitabilityLabel(verdictScore)}
              </>
            ) : (
              SCORE_NA_TEXT
            )}
          </span>
        </div>
      )}
      {isPartial && (
        <div
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            marginTop: -4,
            marginBottom: 8,
            fontStyle: "italic",
          }}
        >
          Partial data
          {missingAttrs.length ? ` — ${missingAttrs.join(", ")} unavailable` : ""}
        </div>
      )}
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
