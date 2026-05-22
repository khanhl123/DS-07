import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import auStates from "../../data/au-states.json";
import {
  getSuitabilityColor,
  getStationAverageScore,
  SCORE_COLORS,
  STATE_FULL_NAMES,
} from "../../data/placeholderData";
import StationPopup from "./StationPopup";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = "© OpenStreetMap © CARTO";
const AU_CENTER = [-25.5, 134.5];
const AU_ZOOM = 4;

function makeStateStyle(supportedNames) {
  return (feature) => {
    const name = feature?.properties?.STATE_NAME;
    return supportedNames.has(name)
      ? {
          fillColor: "#E1F5EE",
          fillOpacity: 0.28,
          color: "#9FE1CB",
          weight: 1,
        }
      : {
          fillColor: "#888888",
          fillOpacity: 0.12,
          color: "#C4C1B5",
          weight: 0.5,
        };
  };
}

export default function LeafletMap({
  stations,
  selectedStationNumber,
  monthIndex,
  year,
  onSelectStation,
}) {
  const [tileStatus, setTileStatus] = useState("loading");
  const stateStyle = useMemo(() => {
    const supported = new Set(
      stations.map((s) => STATE_FULL_NAMES[s.state]).filter(Boolean),
    );
    return makeStateStyle(supported);
  }, [stations]);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--border)",
      }}
    >
      {tileStatus !== "ready" && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-xs"
          style={{
            background: "rgba(240, 240, 232, 0.86)",
            color: "var(--text-secondary)",
          }}
        >
          {tileStatus === "error"
            ? "Map tiles are taking longer than expected. Station markers will appear when the map service responds."
            : "Loading map tiles..."}
        </div>
      )}
      <MapContainer
        center={AU_CENTER}
        zoom={AU_ZOOM}
        minZoom={4}
        maxZoom={12}
        maxBounds={[
          [5, 100],
          [-55, 165],
        ]}
        style={{ height: "500px", width: "100%", background: "#F0F0E8" }}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <TileLayer
          url={TILE_URL}
          attribution={ATTRIBUTION}
          eventHandlers={{
            loading: () => setTileStatus("loading"),
            load: () => setTileStatus("ready"),
            tileerror: () => setTileStatus("error"),
          }}
        />
        <GeoJSON data={auStates} style={stateStyle} />
        {stations.map((station) => {
          const isSelected = station.n === selectedStationNumber;
          const score = station.monthlyScores[monthIndex];
          const confidence = station.monthlyConfidence?.[monthIndex] ?? null;
          // Stations missing 3+ of the 4 weather attributes across the
          // climatology window get a solid grey marker — the per-month score
          // and the station average are both untrustworthy here, so honesty
          // beats a tinted fallback. Default to 0 for legacy data so existing
          // stations.js files (pre-pipeline-rerun) keep current behaviour.
          const isLowDataStation = (station.missingAttrCount ?? 0) >= 3;
          // When the selected month alone is unscorable but the station has
          // enough overall coverage, fall back to the station's climatology
          // average — dimmed + dotted so it's clearly not month-specific.
          const isFallback = score == null && !isLowDataStation;
          let fill, fillOpacity, dashArray;
          if (isLowDataStation) {
            fill = SCORE_COLORS.missing;
            fillOpacity = 0.5;
            dashArray = undefined;
          } else if (isFallback) {
            fill = getSuitabilityColor(getStationAverageScore(station));
            fillOpacity = 0.35;
            dashArray = isSelected ? undefined : "1,3";
          } else {
            // Two non-colour cues, distinct from each other so they don't
            // blur together at small marker sizes:
            //   "3,2" (dashed) -> partial confidence on a month-specific score
            //   "1,3" (dotted) -> climatology fallback (no month-specific score)
            const isPartial = confidence === "partial";
            fill = getSuitabilityColor(score);
            fillOpacity = 0.9;
            dashArray = isPartial && !isSelected ? "3,2" : undefined;
          }
          return (
            <CircleMarker
              key={station.n}
              center={[station.lat, station.lng]}
              radius={isSelected ? 9 : 6}
              pathOptions={{
                fillColor: fill,
                color: isSelected ? "#0F6E56" : "#ffffff",
                weight: isSelected ? 3 : 1.5,
                fillOpacity,
                dashArray,
              }}
              eventHandlers={{
                click: () => onSelectStation(station.n),
                keydown: (e) => {
                  if (e.originalEvent.key === "Enter") onSelectStation(station.n);
                },
              }}
            >
              <Popup autoPan autoPanPadding={[20, 80]}>
                <StationPopup
                  station={station}
                  monthIndex={monthIndex}
                  year={year}
                  onSelect={() => onSelectStation(station.n)}
                />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
