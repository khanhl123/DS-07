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
  computeAdjustedScore,
  getSuitabilityColor,
} from "../../data/placeholderData";
import StationPopup from "./StationPopup";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = "© OpenStreetMap © CARTO";
const AU_CENTER = [-25.5, 134.5];
const AU_ZOOM = 4;

const SUPPORTED_STATES = new Set([
  "Victoria",
  "New South Wales",
  "Tasmania",
  "Northern Territory",
]);

function stateStyle(feature) {
  const name = feature?.properties?.STATE_NAME;
  const supported = SUPPORTED_STATES.has(name);
  return supported
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
}

export default function LeafletMap({
  stations,
  selectedStationNumber,
  monthIndex,
  thresholds,
  onSelectStation,
}) {
  const [tileStatus, setTileStatus] = useState("loading");
  const scored = useMemo(
    () =>
      stations.map((s) => ({
        ...s,
        adjustedScore: computeAdjustedScore(
          s.monthlyScores[monthIndex],
          thresholds,
        ),
      })),
    [stations, monthIndex, thresholds],
  );

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
          [-10, 105],
          [-48, 160],
        ]}
        style={{ height: "50vh", width: "100%", background: "#F0F0E8" }}
        scrollWheelZoom={true}
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
        {scored.map((station) => {
          const isSelected = station.n === selectedStationNumber;
          const fill = getSuitabilityColor(station.adjustedScore);
          return (
            <CircleMarker
              key={station.n}
              center={[station.lat, station.lng]}
              radius={isSelected ? 9 : 6}
              pathOptions={{
                fillColor: fill,
                color: isSelected ? "#0F6E56" : "#ffffff",
                weight: isSelected ? 3 : 1.5,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onSelectStation(station.n),
                keydown: (e) => {
                  if (e.originalEvent.key === "Enter") onSelectStation(station.n);
                },
              }}
            >
              <Popup>
                <StationPopup
                  station={station}
                  monthIndex={monthIndex}
                  thresholds={thresholds}
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
