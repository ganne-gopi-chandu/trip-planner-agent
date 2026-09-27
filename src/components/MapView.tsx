"use client";

import React, { useEffect, useRef } from "react";
import { Trip, Stop } from "@/lib/types";

interface MapViewProps {
  trip: Trip | null;
}

export const MapView: React.FC<MapViewProps> = ({ trip }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || !trip) return;

    // Dynamically import Leaflet to prevent SSR window error
    import("leaflet").then((L) => {
      // Fix default marker icon paths in Leaflet
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Collect all stops with valid location coordinates
      const validStops: { stop: Stop; dayIdx: number }[] = [];
      trip.days.forEach((day, dayIdx) => {
        day.stops.forEach((stop) => {
          if (stop.location && stop.location.lat && stop.location.lng) {
            const lat = typeof stop.location.lat === "string" ? parseFloat(stop.location.lat) : stop.location.lat;
            const lng = typeof stop.location.lng === "string" ? parseFloat(stop.location.lng) : stop.location.lng;
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              validStops.push({ stop: { ...stop, location: { lat, lng } }, dayIdx });
            }
          }
        });
      });

      // Clear previous map instance if exists
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }

      if (validStops.length === 0) return;

      // Initialize Leaflet Map instance
      const firstLat = validStops[0].stop.location!.lat as number;
      const firstLng = validStops[0].stop.location!.lng as number;

      const map = L.map(mapContainerRef.current!).setView([firstLat, firstLng], 12);
      mapInstanceRef.current = map;

      // Dark theme map tile layer (CartoDB Dark Matter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      const routeCoords: [number, number][] = [];

      // Custom marker colors by stop type
      const getMarkerColor = (type: string) => {
        switch (type) {
          case "hotel":
            return "#f59e0b"; // amber
          case "meal":
            return "#10b981"; // emerald
          case "attraction":
            return "#6366f1"; // indigo
          default:
            return "#8b5cf6"; // purple
        }
      };

      validStops.forEach(({ stop, dayIdx }, idx) => {
        const lat = stop.location!.lat as number;
        const lng = stop.location!.lng as number;
        const pos: [number, number] = [lat, lng];
        routeCoords.push(pos);
        bounds.extend(pos);

        const color = getMarkerColor(stop.type);

        // SVG Custom Circle Marker
        const customHtml = `
          <div style="
            background: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">
            ${idx + 1}
          </div>
        `;

        const customIcon = L.divIcon({
          html: customHtml,
          className: "custom-leaflet-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const popupContent = `
          <div style="font-family: sans-serif; color: #0f172a; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${color};">
              Day ${dayIdx + 1} • ${stop.type.toUpperCase()}
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">
              ${stop.name}
            </div>
            ${stop.notes ? `<div style="font-size: 12px; color: #475569; margin-top: 4px;">${stop.notes}</div>` : ""}
          </div>
        `;

        L.marker(pos, { icon: customIcon }).addTo(map).bindPopup(popupContent);
      });

      // Draw polyline connecting route points
      if (routeCoords.length > 1) {
        L.polyline(routeCoords, {
          color: "#818cf8",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.8,
        }).addTo(map);
      }

      if (validStops.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip]);

  if (!trip || !trip.destination) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-sm">No map coordinates available for this trip yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-white/15 shadow-xl relative z-0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />
    </div>
  );
};
