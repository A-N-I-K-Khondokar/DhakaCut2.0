import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Salon } from '../types';

export interface SalonMapViewProps {
  salons: Salon[];
  selectedSalonId?: string;
  onSalonSelect: (salon: Salon) => void;
  userLocation?: { lat: number; lng: number };
  height?: string;
}

// Controller component to dynamically handle map view centering/zooming
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
};

const SelectedMarkerController: React.FC<{
  selectedSalonId?: string;
  markerRefs: React.MutableRefObject<{ [key: string]: L.Marker | null }>;
}> = ({ selectedSalonId, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedSalonId && markerRefs.current[selectedSalonId]) {
      const marker = markerRefs.current[selectedSalonId];
      if (marker) {
        marker.openPopup();
        map.setView(marker.getLatLng(), 14);
      }
    }
  }, [selectedSalonId, markerRefs, map]);
  return null;
};

// Custom Marker SVGs for visual excellence
const normalIconSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" class="w-8 h-8 filter drop-shadow">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>
`;

const selectedIconSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA580C" class="w-9 h-9 filter drop-shadow">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>
`;

const userLocationSVG = `
  <div class="relative flex items-center justify-center h-8 w-8">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-blue-600 border-2 border-white shadow"></span>
  </div>
`;

// Leaflet DivIcons
const normalSalonIcon = L.divIcon({
  html: normalIconSVG,
  className: 'custom-salon-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedSalonIcon = L.divIcon({
  html: selectedIconSVG,
  className: 'custom-selected-salon-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const userLocationIcon = L.divIcon({
  html: userLocationSVG,
  className: 'custom-user-location-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const SalonMapView: React.FC<SalonMapViewProps> = ({
  salons,
  selectedSalonId,
  onSalonSelect,
  userLocation,
  height = '450px',
}) => {
  const dhakaCenter: [number, number] = [23.7808, 90.4093];
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : dhakaCenter;
  const mapZoom = userLocation ? 13 : 12;

  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-250 shadow-sm" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full z-10"
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <SelectedMarkerController selectedSalonId={selectedSalonId} markerRefs={markerRefs} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <span className="font-bold text-xs text-blue-600">📍 You are here</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Salon Branch Markers */}
        {salons.map((salon) => {
          const isSelected = salon.id === selectedSalonId;
          return (
            <Marker
              key={salon.id}
              position={[salon.lat, salon.lng]}
              ref={(ref) => {
                markerRefs.current[salon.id] = ref;
              }}
              icon={isSelected ? selectedSalonIcon : normalSalonIcon}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-gray-800 font-sans min-w-[160px]">
                  <h4 className="font-bold text-sm text-gray-900 leading-tight m-0">{salon.name}</h4>
                  <p className="text-[11px] text-gray-500 m-0 leading-normal">{salon.address}</p>
                  <div className="flex items-center gap-1.5 text-xs m-0">
                    <span className="text-yellow-550 font-bold flex items-center gap-0.5">
                      ★ {salon.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600 font-semibold">{salon.area}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSalonSelect(salon)}
                    className="w-full text-center mt-2 px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded shadow transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-250 p-2.5 rounded-lg shadow-md text-xs font-semibold text-gray-800 space-y-1.5 select-none pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span>🔴</span>
          <span>DhakaCut Salon</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonMapView;
