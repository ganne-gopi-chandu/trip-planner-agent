"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Send, Map, PlaneTakeoff, Sparkles, LayoutList, MessageSquare, RotateCcw, Compass, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ItineraryView } from "@/components/ItineraryView";
import { Trip } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Plan 3 days in Goa with driving transport and beach spots",
  "Plan 4 days in Paris featuring museums, cafes and walking tours",
  "Plan a 2-day food & culture weekend trip in Tokyo",
  "Plan 3 days in Manali with mountain scenic viewpoints",
];

export default function Home() {
  const [savedTrip, setSavedTrip] = useState<Trip | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wander_ai_current_trip");
      if (saved) {
        try {
          setSavedTrip(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved trip", e);
        }
      }
    }
  }, []);

  const [mobileTab, setMobileTab] = useState<"chat" | "itinerary">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput, reload } = useChat();

  // Purely compute active trip from messages or saved trip
  const activeTrip = useMemo<Trip | null>(() => {
    if (!isMounted) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.toolInvocations) {
        for (const invocation of m.toolInvocations) {
          if (invocation.toolName === "updateItinerary") {
            const inv = invocation as unknown as Record<string, unknown>;
            const itinerary =
              (inv.result as { itinerary?: Trip })?.itinerary ||
              (inv.args as { itinerary?: Trip })?.itinerary;
            if (itinerary) return itinerary;
          }
        }
      }
    }
    return savedTrip;
  }, [messages, savedTrip, isMounted]);

  // Persist updated trip to localStorage
  useEffect(() => {
    if (isMounted && activeTrip) {
      localStorage.setItem("wander_ai_current_trip", JSON.stringify(activeTrip));
    }
  }, [activeTrip, isMounted]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSelectPrompt = (promptText: string) => {
    setInput(promptText);
  };

  const handleClearTrip = () => {
    localStorage.removeItem("wander_ai_current_trip");
    setSavedTrip(null);
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <PlaneTakeoff size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Wander AI <Sparkles size={16} className="text-indigo-400" />
            </h1>
            <p className="text-xs text-indigo-300 font-medium">Agentic Trip Planner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTrip && (
            <button
              onClick={handleClearTrip}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
              title="Reset itinerary and clear memory"
            >
              <RotateCcw size={14} />
              Reset Plan
            </button>
          )}

          {/* Mobile View Switcher Toggle */}
          <div className="flex md:hidden bg-white/10 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMobileTab("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mobileTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              <MessageSquare size={14} />
              Chat
            </button>
            <button
              onClick={() => setMobileTab("itinerary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mobileTab === "itinerary" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              <LayoutList size={14} />
              Itinerary
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Chat */}
        <section
          className={`flex-1 flex flex-col min-w-0 h-full ${
            mobileTab === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-indigo-500/15 rounded-full flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Map size={40} className="text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">Where to next?</h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Provide your destination, dates, budget, and ground transport preference. Wander AI will fetch real places, check distances, and build your itinerary.
                  </p>
                </div>

                {/* Suggested prompt chips */}
                <div className="w-full max-w-lg pt-2 space-y-2">
                  <div className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-300">
                    <Compass size={14} />
                    <span>Try asking:</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPrompt(promptText)}
                        className="text-xs bg-white/5 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all duration-200 text-left"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`rounded-3xl px-5 py-3.5 max-w-[88%] shadow-lg ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 rounded-bl-sm"
                  }`}
                >
                  {/* Text content or fallback if assistant emitted only tool call */}
                  {m.content ? (
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.role === "assistant" ? (
                    <div className="text-sm text-slate-200 font-medium leading-relaxed">
                      ✈️ I&apos;ve generated your custom trip plan! Check out the interactive itinerary panel on the right.
                    </div>
                  ) : null}

                  {/* Render active tool calls indicator */}
                  {m.toolInvocations && m.toolInvocations.length > 0 && (
                    <div className={`${m.content ? "mt-3 pt-2.5 border-t border-white/10" : "mt-2"} space-y-1.5`}>
                      {m.toolInvocations.map((tool, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                        >
                          <Sparkles size={12} className="text-indigo-400" />
                          <span>
                            Itinerary updated: <strong className="font-mono">{(tool.args as { itinerary?: { destination?: string } })?.itinerary?.destination || "Trip Details"}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-sm px-5 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 text-slate-400 flex items-center gap-2.5 shadow-lg">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <span className="text-xs text-indigo-300 ml-1">Creating your trip...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center p-2">
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-2xl text-xs shadow-lg">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Connection issue. Click retry to re-send request.</span>
                  <button
                    onClick={() => reload()}
                    className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <footer className="pt-4 shrink-0">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg group-hover:bg-indigo-500/30 transition-all duration-300 -z-10"></div>
              <div className="flex items-center bg-slate-900/90 backdrop-blur-xl border border-white/20 p-2 rounded-full shadow-xl focus-within:border-indigo-500/50">
                <input
                  className="flex-1 px-5 py-3 bg-transparent outline-none text-slate-100 text-sm placeholder:text-slate-500"
                  value={input}
                  placeholder="Plan a 3-day trip to Goa, driving transport..."
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input?.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center mr-1"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </footer>
        </section>

        {/* Right Column: Visual Itinerary Card */}
        <section
          className={`flex-1 min-w-0 h-full ${
            mobileTab === "itinerary" ? "flex" : "hidden md:flex"
          }`}
        >
          <ItineraryView trip={activeTrip} onUpdateTrip={(updated) => setSavedTrip(updated)} />
        </section>
      </div>
    </div>
  );
}

