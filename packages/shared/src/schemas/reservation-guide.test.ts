import { describe, expect, it } from "vitest";
import { reservationGuideSchema } from "./reservation-guide.ts";

const validGuide = {
  title: "Book a table",
  description: "I can help you find a restaurant and complete a booking.",
  steps: [
    { title: "Discover", description: "Tell me the cuisine or area." },
    { title: "Review", description: "Look at restaurants and menus." },
    { title: "Details", description: "Give the date, time and party size." },
    { title: "Confirm", description: "Review and confirm the booking." },
  ],
  followUpQuestion: "Which cuisine would you like to start with?",
};

describe("reservationGuideSchema", () => {
  it("accepts a guide with exactly four steps", () => {
    expect(reservationGuideSchema.safeParse(validGuide).success).toBe(true);
  });

  it("trims surrounding whitespace from the title", () => {
    const result = reservationGuideSchema.parse({
      ...validGuide,
      title: "  Book a table  ",
    });

    expect(result.title).toBe("Book a table");
  });

  it("rejects a guide with fewer than four steps", () => {
    const result = reservationGuideSchema.safeParse({
      ...validGuide,
      steps: validGuide.steps.slice(0, 3),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a blank title", () => {
    const result = reservationGuideSchema.safeParse({
      ...validGuide,
      title: "   ",
    });

    expect(result.success).toBe(false);
  });
});
