"use client";

import React, { useState } from "react";
import { Trip, Stop } from "@/lib/types";
import { MapView } from "./MapView";
import {
  exportToICS,
  printItinerary,
  copyShareableLink,
  getRouteStats,
} from "@/lib/exportUtils";
import {
  Calendar,
  IndianRupee,
  Footprints,
  Bus,
  Car,
  Bike,
  Navigation,
  MapPin,
  Clock,
  Utensils,
  Landmark,
  Hotel,
  Plane,
  Sparkles,
  Download,
  Printer,
  Share2,
  Trash2,
  Plus,
  Sun,
  Map as MapIcon,
  ListFilter,
  ExternalLink,
  Check,
} from "lucide-react";

interface ItineraryViewProps {
  trip: Trip | null;
  onUpdateTrip?: (updatedTrip: Trip) => void;
}

const transportIcons = {
  walking: Footprints,
  transit: Bus,
  driving: Car,
  cycling: Bike,
  rideshare: Navigation,
};

const stopTypeIcons = {
  attraction: Landmark,
  meal: Utensils,
  hotel: Hotel,
  flight: Plane,
  transport: Bus,
  other: MapPin,
};

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onUpdateTrip }) => {
  const [viewMode, setViewMode] = useState<"timeline" | "map">("timeline");
  const [copiedLink, setCopiedLink] = useState(false);
  const [newStopDayIdx, setNewStopDayIdx] = useState<number | null>(null);
  const [newStopName, setNewStopName] = useState("");
  const [newStopType, setNewStopType] = useState<Stop["type"]>("attraction");

  if (!trip || !trip.destination) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <div className="w-16 h-16 mb-4 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <Calendar size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white">No Active Itinerary</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-xs">
          Start chatting with Wander AI to generate your customized trip plan. It will appear here live!
        </p>
      </div>
    );
  }

  const TransportIcon =
    (trip.transportMode && transportIcons[trip.transportMode as keyof typeof transportIcons]) || Navigation;

  // Format budget in Rupees
  const displayBudget = trip.estimatedBudget
    ? trip.estimatedBudget
    : trip.budget
    ? String(trip.budget).startsWith("₹")
      ? trip.budget
      : `₹${trip.budget}`
    : null;

  const handleCopyShare = async () => {
    const success = await copyShareableLink(trip);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDeleteStop = (dayIdx: number, stopIdx: number) => {
    if (!onUpdateTrip) return;
    const updatedDays = trip.days.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        stops: day.stops.filter((_, sIdx) => sIdx !== stopIdx),
      };
    });
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  const handleAddStopSubmit = (dayIdx: number) => {
    if (!newStopName.trim() || !onUpdateTrip) return;

    const newStopItem: Stop = {
      name: newStopName.trim(),
      type: newStopType,
      time: "10:00 AM",
      notes: "Custom added stop",
    };

    const updatedDays = trip.days.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        stops: [...day.stops, newStopItem],
      };
    });

    onUpdateTrip({ ...trip, days: updatedDays });
    setNewStopName("");
    setNewStopDayIdx(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header Banner */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border-b border-white/10 shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {trip.status === "confirmed" ? "Confirmed Trip" : "Draft Itinerary"}
            </span>
            <h2 className="text-2xl font-bold text-white capitalize mt-1.5 flex items-center gap-2">
              {trip.destination}
            </h2>
          </div>

          {/* Action Tools Header Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-medium">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  viewMode === "timeline" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <ListFilter size={13} />
                Timeline
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  viewMode === "map" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <MapIcon size={13} />
                Map
              </button>
            </div>

            {/* Export & Share Action Buttons */}
            <button
              onClick={() => exportToICS(trip)}
              className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl border border-white/15 transition-colors"
              title="Download iCalendar (.ics)"
            >
              <Download size={15} />
            </button>
            <button
              onClick={printItinerary}
              className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl border border-white/15 transition-colors"
              title="Print or Save PDF"
            >
              <Printer size={15} />
            </button>
            <button
              onClick={handleCopyShare}
              className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl border border-white/15 transition-colors flex items-center gap-1 text-xs"
              title="Copy shareable trip link"
            >
              {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
            </button>
          </div>
        </div>

        {/* Metadata stats */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3.5 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 text-indigo-200 font-medium">
            <Calendar size={14} className="text-indigo-400" />
            <span>{trip.days.length} Days Trip</span>
          </div>

          {displayBudget && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-emerald-300 font-medium">
              <IndianRupee size={14} className="text-emerald-400" />
              <span>Budget: {displayBudget}</span>
            </div>
          )}

          {trip.transportMode && (
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-indigo-200 font-medium capitalize">
              <TransportIcon size={14} />
              <span>{trip.transportMode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content View (Timeline or Interactive Map) */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
        {viewMode === "map" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold uppercase tracking-wider">Interactive Route Map</span>
              <span>{trip.destination}</span>
            </div>
            <MapView trip={trip} />
          </div>
        ) : (
          <div className="space-y-6">
            {trip.days.map((day, dayIdx) => {
              let dayTitle = `Day ${dayIdx + 1}`;
              if (typeof day.date === "string" && day.date.trim()) {
                const trimmed = day.date.trim();
                if (trimmed.toLowerCase().startsWith("day")) {
                  dayTitle = trimmed;
                } else if (!trimmed.includes("-") && !trimmed.includes("T")) {
                  dayTitle = `Day ${dayIdx + 1}: ${trimmed}`;
                }
              }

              return (
                <div key={dayIdx} className="space-y-3">
                  {/* Day Header with Weather Forecast Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                        {dayIdx + 1}
                      </span>
                      {dayTitle}
                    </h3>

                    {/* Weather Forecast Badge */}
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-300 text-xs font-medium">
                      <Sun size={13} className="text-amber-400" />
                      <span>{day.weather?.temp || "28°C"} {day.weather?.condition || "Sunny"}</span>
                      {day.weather?.rainChance && <span className="text-[10px] text-amber-400/80">({day.weather.rainChance} rain)</span>}
                    </div>
                  </div>

                  {/* Day Stops List */}
                  <div className="space-y-2.5 pl-3 border-l-2 border-indigo-500/20 ml-3">
                    {day.stops.map((stop, stopIdx) => {
                      const IconComponent = stopTypeIcons[stop.type] || MapPin;
                      const isHotel = stop.type === "hotel";
                      const nextStop = day.stops[stopIdx + 1];
                      const routeStats = nextStop ? getRouteStats(stop, nextStop, trip.transportMode || "driving") : null;

                      // Generate Direct Hotel Booking Search Link
                      const bookingSearchUrl = `https://www.google.com/travel/hotels?q=${encodeURIComponent(
                        `${stop.name} ${trip.destination}`
                      )}`;

                      return (
                        <React.Fragment key={stopIdx}>
                          <div
                            className={`p-4 transition-all border rounded-2xl flex items-start gap-3.5 group relative ${
                              isHotel
                                ? "bg-indigo-950/40 hover:bg-indigo-900/40 border-indigo-500/40 shadow-lg shadow-indigo-900/20"
                                : "bg-white/5 hover:bg-white/10 border-white/10"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl border group-hover:scale-105 transition-transform ${
                                isHotel
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              }`}
                            >
                              <IconComponent size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h4 className="text-sm font-semibold text-white truncate">
                                    {stop.name}
                                  </h4>
                                  {isHotel && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium shrink-0 flex items-center gap-1">
                                      <Sparkles size={10} /> Recommended Stay
                                    </span>
                                  )}
                                </div>
                                {stop.time && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                    <Clock size={12} />
                                    {stop.time}
                                  </span>
                                )}
                              </div>

                              {stop.notes && (
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  {stop.notes}
                                </p>
                              )}

                              {/* Hotel Direct Booking Link */}
                              {isHotel && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                  <span className="text-xs text-amber-300 font-medium">
                                    {stop.pricePerNight ? `Price: ${stop.pricePerNight}` : "Best Rates Guaranteed"}
                                  </span>
                                  <a
                                    href={stop.bookingUrl || bookingSearchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
                                  >
                                    <span>Book Stay</span>
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Delete Stop Control */}
                            {onUpdateTrip && (
                              <button
                                onClick={() => handleDeleteStop(dayIdx, stopIdx)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 transition-opacity"
                                title="Delete stop"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          {/* Distance & Travel Duration Chip between stops */}
                          {routeStats && (
                            <div className="my-1.5 ml-6 flex items-center gap-2 text-[11px] font-mono text-indigo-300/80 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-max">
                              <span>{routeStats}</span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                  {/* Add Custom Stop Component */}
                  {onUpdateTrip && (
                    <div>
                      {newStopDayIdx === dayIdx ? (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2 mt-2">
                          <input
                            type="text"
                            placeholder="Stop name (e.g. Cafe des Arts)"
                            value={newStopName}
                            onChange={(e) => setNewStopName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={newStopType}
                              onChange={(e) => setNewStopType(e.target.value as Stop["type"])}
                              className="px-2.5 py-1 bg-slate-900 border border-white/15 rounded-xl text-xs text-slate-300 outline-none"
                            >
                              <option value="attraction">Attraction</option>
                              <option value="meal">Meal / Dining</option>
                              <option value="hotel">Hotel / Stay</option>
                              <option value="transport">Transport</option>
                            </select>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setNewStopDayIdx(null)}
                                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddStopSubmit(dayIdx)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                              >
                                Save Stop
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewStopDayIdx(dayIdx)}
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1 px-1 transition-colors"
                        >
                          <Plus size={14} />
                          <span>Add custom stop</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};
