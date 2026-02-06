

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Issue } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

// Fix Leaflet marker icon issue in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Coordinate mapping for mock neighborhoods (Focusing on Bangalore for this prototype as used in mock-data)
// If mock data changes to other cities, these would need updates.
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  "Indiranagar": [12.9716, 77.6412],
  "Koramangala": [12.9352, 77.6245],
  "Whitefield": [12.9698, 77.7500],
  "HSR Layout": [12.9121, 77.6446],
  "Jayanagar": [12.9308, 77.5838],
  "Bandra West": [19.0600, 72.8337], // Mumbai
  "Andheri East": [19.1136, 72.8697],
  "Powai": [19.1176, 72.9060],
  "Colaba": [18.9067, 72.8147],
  "Dadar": [19.0183, 72.8441],
  "Connaught Place": [28.6304, 77.2177], // Delhi
  "Saket": [28.5246, 77.2066],
  "Dwarka": [28.5823, 77.0500],
  "Vasant Kunj": [28.5423, 77.1558],
  "Lajpat Nagar": [28.5677, 77.2433]
};

// Helper to add slight random jitter to coordinates so points don't stack perfectly
const jitter = (coord: number) => coord + (Math.random() - 0.5) * 0.005;

interface HeatmapMapProps {
    onSelectNeighborhood: (name: string) => void;
    selectedNeighborhood: string | null;
    issues: Issue[];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13, { duration: 1.5 });
    }, [center, map]);
    return null;
}

export default function HeatmapView({ onSelectNeighborhood, selectedNeighborhood, issues }: HeatmapMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-muted flex items-center justify-center">Loading Map...</div>;

  // Process data to get points
  const points = issues.map(issue => {
    const baseCoords = NEIGHBORHOOD_COORDS[issue.location];
    if (!baseCoords) return null;
    return {
        ...issue,
        lat: jitter(baseCoords[0]),
        lng: jitter(baseCoords[1])
    };
  }).filter(p => p !== null);

  // Group by Neighborhood for "Heat" circles
  const neighborhoodSeverity = Object.keys(NEIGHBORHOOD_COORDS).map(name => {
      const neighborhoodIssues = issues.filter(i => i.location === name);
      const severity = neighborhoodIssues.length; // Simple count-based severity
      const coords = NEIGHBORHOOD_COORDS[name];
      return { name, severity, coords };
  }).filter(n => n.severity > 0);

  const activeCenter = selectedNeighborhood && NEIGHBORHOOD_COORDS[selectedNeighborhood] 
    ? NEIGHBORHOOD_COORDS[selectedNeighborhood] 
    : [12.9716, 77.6412] as [number, number]; // Default to Indiranagar

  return (
    <MapContainer 
        center={activeCenter} 
        zoom={12} 
        className="w-full h-full z-0"
        scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
      
      <MapUpdater center={activeCenter} />

      {/* Heat Circles (Aggregation) */}
      {neighborhoodSeverity.map((n) => (
          <Circle
            key={`circle-${n.name}`}
            center={n.coords}
            pathOptions={{ 
                fillColor: n.severity > 5 ? 'red' : n.severity > 2 ? 'orange' : 'green', 
                color: n.severity > 5 ? 'red' : n.severity > 2 ? 'orange' : 'green',
                fillOpacity: 0.3,
                weight: 1
            }}
            radius={n.severity * 150} // Radius based on issue count
            eventHandlers={{
                click: () => onSelectNeighborhood(n.name)
            }}
          />
      ))}

      {/* Individual Issue Markers */}
      {points.map((point) => (
          point && (
            <Marker 
                key={point.id} 
                position={[point.lat, point.lng]} 
                icon={customIcon}
                eventHandlers={{
                    click: () => onSelectNeighborhood(point.location)
                }}
            >
                <Popup className="glass-popup">
                    <div className="p-1 min-w-[200px]">
                        <Badge variant="outline" className="mb-2 text-[10px]">{point.category}</Badge>
                        <h3 className="font-bold text-sm text-foreground mb-1">{point.title}</h3>
                        <p className="text-xs text-muted-foreground">{point.location}</p>
                    </div>
                </Popup>
            </Marker>
          )
      ))}
    </MapContainer>
  );
}

