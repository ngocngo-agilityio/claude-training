import { Mastra } from "@mastra/core/mastra";
import {
  MastraPlatformExporter,
  MastraStorageExporter,
  Observability,
  SensitiveDataFilter,
} from "@mastra/observability";
import { configureApi } from "@repo/shared/config/api";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { API_PATHS } from "@repo/shared/constants/api";

import { getStorage } from "./storage";
import { restaurantReservationAgent } from "./agents/restaurant";
import { authenticationMiddleware } from "./auth/authentication-middleware";
import { copilotKitRoute } from "./routes/copilotkit";
import {
  deleteConversationRoute,
  listConversationsRoute,
} from "./routes/conversations";
import {
  resumeReservationReviewRoute,
  startReservationReviewRoute,
} from "./routes/reservation-review";
import { resetConversationRoute } from "./routes/reset-conversation";
import { reservationBookingWorkflow } from "./workflows/reservation-booking-workflow";

// Tools call the restaurants API through the shared services.
configureApi({
  restaurantsApiDomain: process.env.RESTAURANTS_API_DOMAIN ?? "",
});

export const mastra = new Mastra({
  agents: {
    [AGENT_IDS.RESTAURANT_RESERVATION]: restaurantReservationAgent,
  },
  workflows: {
    reservationBookingWorkflow,
  },
  storage: getStorage(),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra-copilotkit",
        exporters: [new MastraStorageExporter(), new MastraPlatformExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
  bundler: {
    externals: [
      "@mastra/core",
      "@mastra/libsql",
      "@mastra/memory",
      "zod",
      "@copilotkit/runtime/v2",
      "@ag-ui/mastra",
      "@ag-ui/client",
      "@ag-ui/core",
      "jsonwebtoken",
    ],
  },
  server: {
    port: Number(process.env.PORT ?? 4750),
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    middleware: [
      // Keep authentication policy at the server boundary for every private API.
      {
        path: API_PATHS.COPILOTKIT,
        handler: authenticationMiddleware,
      },
      {
        path: API_PATHS.CONVERSATIONS,
        handler: authenticationMiddleware,
      },
      {
        path: `${API_PATHS.CONVERSATIONS}/*`,
        handler: authenticationMiddleware,
      },
      {
        path: API_PATHS.RESERVATIONS_REVIEW,
        handler: authenticationMiddleware,
      },
      {
        path: API_PATHS.RESERVATIONS_RESUME,
        handler: authenticationMiddleware,
      },
    ],
    apiRoutes: [
      // Manage the conversation list shown in the sidebar.
      listConversationsRoute,
      deleteConversationRoute,
      // Clear messages while keeping the current thread.
      resetConversationRoute,
      // Starts the booking workflow and pauses it for review.
      startReservationReviewRoute,
      // Continues a paused booking workflow with the user's decision.
      resumeReservationReviewRoute,
      // Connect the frontend chat endpoint to the Mastra restaurant agent.
      copilotKitRoute,
    ],
  },
});
