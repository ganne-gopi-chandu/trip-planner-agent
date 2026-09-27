import { z } from "zod";

export const StopSchema = z.object({
  time: z.string().optional().nullable(),
  name: z.string(),
  type: z.enum(["attraction", "meal", "flight", "hotel", "transport", "other"]),
  location: z
    .object({
      lat: z.any().optional().nullable(),
      lng: z.any().optional().nullable(),
    })
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
  pricePerNight: z.string().optional().nullable(),
  distanceToNext: z.string().optional().nullable(),
  bookingUrl: z.string().optional().nullable(),
  sourceToolCallId: z.string().optional().nullable(),
});

export const WeatherSchema = z.object({
  temp: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  rainChance: z.string().optional().nullable(),
});

export const DaySchema = z.object({
  date: z.string(),
  weather: WeatherSchema.optional().nullable(),
  stops: z.array(StopSchema),
});

export const TripSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(7)),
  userId: z.string().optional().nullable(),
  destination: z.string(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  estimatedBudget: z.string().optional().nullable(),
  transportMode: z.string().optional().nullable(),
  status: z.enum(["draft", "confirmed"]).default("draft"),
  days: z.array(DaySchema),
});

export type Stop = z.infer<typeof StopSchema>;
export type Day = z.infer<typeof DaySchema>;
export type Trip = z.infer<typeof TripSchema>;
