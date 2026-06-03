import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

interface MapMarker {
  id: number | string;
  lat: number;
  lng: number;
  name: string;
  info: string;
  status: 'online' | 'warning' | 'offline';
}

interface MapWidgetProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  onMarkerClick?: (id: any) => void;
  height?: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({
  center,
  zoom,
  markers,
  onMarkerClick,
  height = '340px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const { theme } = useApp();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(center, zoom);

    mapInstanceRef.current = map;

    // Add Tile Layer (OSM standard)
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Group for markers
    const group = L.featureGroup().addTo(map);
    markersGroupRef.current = group;

    // Update map size when rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      tiles.remove();
      group.remove();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // Watch for center/zoom shifts
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Watch for markers list modifications
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    // Clear old markers
    group.clearLayers();

    markers.forEach((m) => {
      const col =
        m.status === 'online'
          ? '#13A34A'
          : m.status === 'warning'
          ? '#FFB600'
          : '#FF7424';

      const marker = L.circleMarker([m.lat, m.lng], {
        radius: zoom > 6 ? 6 : 8,
        fillColor: col,
        color: theme === 'dark' ? '#091E30' : '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
      });

      marker.bindTooltip(`<b>${m.name}</b><br/>${m.info}`);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(m.id));
      }

      marker.addTo(group);
    });

    // Fit bounds automatically if multiple markers are shown and center isn't customized
    if (markers.length > 1 && zoom === 4) {
      try {
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (e) {
        // Suppress fitting errors
      }
    }
  }, [markers, theme, zoom, onMarkerClick]);

  return (
    <div className="map-ct" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: 'var(--rl)' }} />
    </div>
  );
};

export default MapWidget;
