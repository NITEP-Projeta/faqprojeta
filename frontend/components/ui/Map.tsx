// components/admin/Map.tsx
'use client';

import { FC } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

interface MapProps {
  points: { lat: number; lng: number; count: number }[];
}

export const Map: FC<MapProps> = ({ points }) => (
  <MapContainer center={[0,0]} zoom={2} style={{ height:'300px', width:'100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {points.map((p,i) => (
      <CircleMarker
        key={i}
        center={[p.lat, p.lng]}
        radius={Math.min(20, p.count / 2)}
        color="red"
      >
        <Tooltip>{p.count} acessos</Tooltip>
      </CircleMarker>
    ))}
  </MapContainer>
);
