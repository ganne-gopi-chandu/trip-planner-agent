import { Trip, Stop } from "./types";

/**
 * Calculates straight-line distance in kilometers between two lat/lng points
 */
export function calculateDistanceKm(
  lat1: number | string,
  lng1: number | string,
  lat2: number | string,
  lng2: number | string
): number {
  const nLat1 = typeof lat1 === "string" ? parseFloat(lat1) : lat1;
  const nLng1 = typeof lng1 === "string" ? parseFloat(lng1) : lng1;
  const nLat2 = typeof lat2 === "string" ? parseFloat(lat2) : lat2;
  const nLng2 = typeof lng2 === "string" ? parseFloat(lng2) : lng2;

  if (isNaN(nLat1) || isNaN(nLng1) || isNaN(nLat2) || isNaN(nLng2)) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLng = ((nLng2 - nLng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Formats distance and estimated drive/walk duration string
 */
export function getRouteStats(stopA: Stop, stopB: Stop, transportMode: string = "driving"): string | null {
  if (!stopA.location || !stopB.location) return null;
  const distKm = calculateDistanceKm(
    stopA.location.lat,
    stopA.location.lng,
    stopB.location.lat,
    stopB.location.lng
  );

  if (distKm <= 0) return null;

  let speedKmH = 30; // average driving speed in city
  let modeIcon = "🚗";
  if (transportMode === "walking") {
    speedKmH = 4.5;
    modeIcon = "🚶";
  } else if (transportMode === "cycling") {
    speedKmH = 15;
    modeIcon = "🚲";
  } else if (transportMode === "transit") {
    speedKmH = 20;
    modeIcon = "🚌";
  }

  const mins = Math.round((distKm / speedKmH) * 60);
  const timeStr = mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} mins`;

  return `${modeIcon} ${timeStr} • ${distKm} km`;
}

/**
 * Generates an iCalendar (.ics) file and triggers download
 */
export function exportToICS(trip: Trip) {
  if (!trip || !trip.destination) return;

  let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wander AI//Trip Planner//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:${trip.destination} Trip Itinerary\r\n`;

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  trip.days.forEach((day, dayIdx) => {
    day.stops.forEach((stop, stopIdx) => {
      const summary = `${stop.name} (${stop.type.toUpperCase()})`;
      const description = stop.notes ? stop.notes.replace(/\n/g, "\\n") : "";
      const uid = `wander-ai-${trip.id}-d${dayIdx}-s${stopIdx}-${Date.now()}@wander.ai`;

      icsContent += `BEGIN:VEVENT\r\n`;
      icsContent += `UID:${uid}\r\n`;
      icsContent += `DTSTAMP:${now}\r\n`;
      icsContent += `SUMMARY:📍 ${summary}\r\n`;
      icsContent += `DESCRIPTION:${description}\r\n`;
      icsContent += `LOCATION:${trip.destination}\r\n`;
      icsContent += `STATUS:CONFIRMED\r\n`;
      icsContent += `END:VEVENT\r\n`;
    });
  });

  icsContent += `END:VCALENDAR\r\n`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${trip.destination.toLowerCase().replace(/\s+/g, "_")}_itinerary.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers standard print dialog optimized for saving as PDF
 */
export function printItinerary() {
  window.print();
}

/**
 * Generates shareable URL link for current trip
 */
export async function copyShareableLink(trip: Trip): Promise<boolean> {
  try {
    const encoded = encodeURIComponent(JSON.stringify(trip));
    const shareUrl = `${window.location.origin}/?trip=${encoded}`;
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (e) {
    console.error("Failed to copy link", e);
    return false;
  }
}
