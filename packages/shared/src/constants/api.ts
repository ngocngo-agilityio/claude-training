export const API_PATHS = {
  LOGIN: "/login",
  COPILOTKIT: "/copilotkit",
  // Lists conversations and supports deleting one by thread ID.
  CONVERSATIONS: "/conversations",
  // Custom Mastra endpoint that clears messages but preserves the thread.
  RESET_CONVERSATION: "/conversations/reset",
  RESTAURANTS: "/restaurants",
  RESTAURANT_MENUS: "/menus",
  RESERVATIONS: "/reservations",
  // Starts the booking workflow and pauses it for the user's review.
  RESERVATIONS_REVIEW: "/reservations/review",
  // Continues a paused booking workflow with the user's decision.
  RESERVATIONS_RESUME: "/reservations/resume",
} as const;
