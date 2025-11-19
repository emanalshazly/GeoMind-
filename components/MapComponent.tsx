import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates } from '../types';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet markers in React
const iconPerson = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapComponentProps {
  userLocation: Coordinates | null;
  onLocationUpdate: (coords: Coordinates) => void;
}

// Component to handle map movement updates
const MapEvents = ({ onMove }: { onMove: (coords: Coordinates) => void }) => {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMove({ lat: center.lat, lng: center.lng });
    },
  });
  return null;
};

// Component to recenter map when user location changes initially
const RecenterMap = ({ coords }: { coords: Coordinates }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ userLocation, onLocationUpdate }) => {
  const [initialCenter] = useState<Coordinates>({ lat: 37.7749, lng: -122.4194 }); // Default SF

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[initialCenter.lat, initialCenter.lng]} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false} // We'll add custom controls if needed or rely on defaults
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={iconPerson}>
              <Popup>
                You are here
              </Popup>
            </Marker>
            <RecenterMap coords={userLocation} />
          </>
        )}

        <MapEvents onMove={onLocationUpdate} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;