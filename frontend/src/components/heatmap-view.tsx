
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useIssues } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";

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

import { Issue } from "@/lib/mock-data";

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
  // const { issues } = useIssues(); // Removed: Now using prop
  const [dynamicCoords, setDynamicCoords] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Geocoding Effect
  useEffect(() => {
    const locationsToFetch = new Set<string>();
    issues.forEach(i => {
      // Check if location is unknown (neither in static list nor already fetched)
      if (!NEIGHBORHOOD_COORDS[i.location] && !dynamicCoords[i.location]) {
        locationsToFetch.add(i.location);
      }
    });

    const fetchCoords = async () => {
      const newCoords: Record<string, [number, number]> = {};
      const locs = Array.from(locationsToFetch);

      for (const loc of locs) {
        try {
          // Append 'Bangalore' or similar context if needed, or keep generic. 
          // Using generic search for now.
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}&limit=1`, {
            headers: { 'User-Agent': 'TenantWatch-App/1.0' }
          });
          const data = await res.json();
          if (data && data.length > 0) {
            newCoords[loc] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }
        } catch (e) {
          console.error(`Failed to geocode ${loc}`, e);
        }
        // Politeness delay for OpenStreetMap
        await new Promise(r => setTimeout(r, 1000));
      }

      if (Object.keys(newCoords).length > 0) {
        setDynamicCoords(prev => ({ ...prev, ...newCoords }));
      }
    };

    if (locationsToFetch.size > 0) {
      fetchCoords();
    }
  }, [issues, dynamicCoords]);

  if (!mounted) return <div className="w-full h-full bg-muted flex items-center justify-center">Loading Map...</div>;

  const allCoords = { ...NEIGHBORHOOD_COORDS, ...dynamicCoords };

  // Process data to get points
  const points = issues.map(issue => {
    const baseCoords = allCoords[issue.location];
    if (!baseCoords) return null;
    return {
      ...issue,
      lat: jitter(baseCoords[0]),
      lng: jitter(baseCoords[1])
    };
  }).filter(p => p !== null);

  // Group by Neighborhood for "Heat" circles
  const neighborhoodSeverity = Object.keys(allCoords).map(name => {
    const locationIssues = issues.filter(i => i.location === name);
    const severity = locationIssues.length; // Simple count-based severity
    const coords = allCoords[name];
    if (severity === 0) return null;
    return { name, severity, coords };
  }).filter(n => n !== null) as { name: string, severity: number, coords: [number, number] }[];

  const activeCenter = selectedNeighborhood && allCoords[selectedNeighborhood]
    ? allCoords[selectedNeighborhood]
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
                <Badge variant="outline" className="mb-2 text-[10px] text-slate-800 border-slate-300">{point.category}</Badge>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{point.title}</h3>
                <p className="text-xs text-slate-600 mb-1">{point.location}</p>
                {point.images && point.images.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <ImageIcon className="h-3 w-3" />
                    <span>{point.images.length} image(s)</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
