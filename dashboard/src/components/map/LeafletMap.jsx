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
          const fill = getSuitabilityColor(score);
          // Translucent grey for unscorable months so the marker stays
          // visible and clickable but is clearly distinct from a real score.
          const fillOpacity = score == null ? 0.5 : 0.9;
          // Dashed border on partial-data scores — non-color cue so the
          // distinction survives the score colour band and colour-blindness.
          const isPartial = confidence === "partial";
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
                dashArray: isPartial && !isSelected ? "3,2" : undefined,
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
