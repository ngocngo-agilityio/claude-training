import { z } from "zod";

export const reservationGuideSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .describe("A friendly title in the user's language"),
  description: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .describe(
      "A concise introduction explaining that the assistant can help discover a restaurant and complete a booking",
    ),
  steps: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1)
          .max(60)
          .describe("A short action-oriented step title"),
        description: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe("One sentence explaining what the user can provide or do"),
      }),
    )
    .min(4)
    .max(4)
    .describe(
      "Exactly four steps covering discovery, restaurant/menu review, booking details, and final confirmation",
    ),
  followUpQuestion: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .describe(
      "One short question in the user's language asking which cuisine, location, or restaurant they want to start with; do not repeat any guide content",
    ),
});

export type ReservationGuideProps = z.infer<typeof reservationGuideSchema>;
