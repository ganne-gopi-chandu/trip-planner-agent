import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { TripSchema } from "./lib/types";

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyCReE9Ik2I4H-YJ8G-uFIIFrsGo6CCF_xc";

async function main() {
  try {
    console.log("Testing streamText with tools...");
    const result = streamText({
      model: google("gemini-3.5-flash"),
      system: `You are Wander AI, an agile agentic travel planner.
When the user asks for a trip plan:
1. Provide a short, friendly text summary of the trip highlights.
2. Call the updateItinerary tool to update the UI.`,
      messages: [{ role: "user", content: "plan trip to goa for 3 days" }],
      maxSteps: 1,
      tools: {
        updateItinerary: tool({
          description: "Update the structured Trip object to render the visual itinerary UI.",
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

    for await (const chunk of result.fullStream) {
      console.log("Chunk:", chunk.type, JSON.stringify(chunk));
    }
    console.log("Done!");
  } catch (err) {
    console.error("EXACT ERROR IN STREAM:", err);
  }
}

main();
