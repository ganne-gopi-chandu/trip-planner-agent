import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { TripSchema } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Sanitize message history to keep Gemini API happy during multi-turn chats
    const cleanMessages = messages
      .map((m: { role: string; content?: string }) => {
        const text = typeof m.content === "string" ? m.content.trim() : "";
        if (m.role === "assistant" && !text) {
          return { role: "assistant", content: "I've created your trip itinerary." };
        }
        return { role: m.role, content: text };
      })
      .filter((m: { content: string }) => m.content.length > 0);

    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      maxRetries: 5,
      system: `You are Wander AI, an agile and expert agentic travel planner.
When the user asks for a trip plan or asks to update a trip:
1. ALWAYS write a short, friendly Markdown response summarizing trip highlights, estimated budget in Indian Rupees (₹), and recommended hotel/resort stays.
2. ALWAYS call the updateItinerary tool to populate the visual UI.
CRITICAL FORMATTING RULES FOR updateItinerary:
- BUDGET: Estimate total & avg per-day budget in Indian Rupees (₹). Set estimatedBudget field (e.g. "₹20,000 (Avg ₹3,000/day)").
- DAY DATES: Strictly format day date fields as "Day 1", "Day 2", "Day 3", etc. (DO NOT output calendar date strings like "2025-03-01" or "MON, JAN 1").
- HOTELS & RESORTS: Place 1 primary recommended hotel/resort check-in on Day 1 (type: "hotel", set pricePerNight e.g. "₹3,500/night", and list alternative stay options in notes). Do NOT repeat hotel check-in on every single day unless moving to a new region/city. Match the user's target budget level.
- WEATHER FORECAST: Include estimated weather for each day (e.g. weather: { temp: "28°C", condition: "Sunny", rainChance: "10%" }).`,
      messages: cleanMessages,
      maxSteps: 1,
      tools: {
        updateItinerary: tool({
          description: "Update the structured Trip object to render the visual itinerary UI panel.",
          parameters: z.object({
            itinerary: TripSchema,
          }),
          execute: async ({ itinerary }) => {
            return {
              status: "success",
              itinerary,
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage(err) {
        console.error("FULL API STREAM ERROR:", err);
        return err instanceof Error ? err.message : String(err);
      },
    });
  } catch (error: unknown) {
    console.error("POST API Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

