import { useMemo } from "react";
import {
  computeAdjustedScore,
  getSuitabilityColor,
} from "../../data/placeholderData";

const R_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export default function NearbyStationChips({
  selectedStation,
  stations,
  monthIndex,
  thresholds,
  onSelect,
}) {
  const nearby = useMemo(() => {
    if (!selectedStation) return [];
    const inState = stations.filter(
      (s) => s.state === selectedStation.state && s.n !== selectedStation.n,
    );
    return inState
      .map((s) => ({ station: s, km: haversineKm(selectedStation, s) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);
  }, [selectedStation, stations]);

  if (!selectedStation || nearby.length === 0) return null;

  const primaryChip = (
    <span
      key={selectedStation.n}
      className="inline-flex items-center gap-2 px-2.5 py-1 text-xs"
      style={{
        background: "var(--primary-lightest)",
        border: "1px solid var(--primary-border)",
        borderRadius: "var(--radius)",
        color: "var(--primary)",
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: getSuitabilityColor(
            computeAdjustedScore(
              selectedStation.monthlyScores[monthIndex],
              thresholds,
            ),
          ),
        }}
      />
      {selectedStation.name}
    </span>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={`Nearby stations in ${selectedStation.state}`}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        Nearby ({selectedStation.state})
      </span>
      {primaryChip}
      {nearby.map(({ station, km }) => {
        const score = computeAdjustedScore(
          station.monthlyScores[monthIndex],
          thresholds,
        );
        return (
          <button
            key={station.n}
            type="button"
            onClick={() => onSelect(station.n)}
            className="inline-flex items-center gap-2 px-2.5 py-1 text-xs"
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            aria-label={`Select ${station.name}, ${Math.round(km)} km away`}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: getSuitabilityColor(score),
              }}
            />
            <span className="font-medium">{station.name}</span>
            <span style={{ color: "var(--text-muted)" }}>
              {Math.round(km)} km
            </span>
          </button>
        );
      })}
    </div>
  );
}
