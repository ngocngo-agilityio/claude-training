import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureApi } from "@repo/shared/config/api";
import { useAuthStore } from "@/stores/auth-store";
import "./index.css";
import App from "./App.tsx";

// Shared services read their endpoints from this config instead of Vite's env.
configureApi({
  mastraBaseUrl: import.meta.env.VITE_MASTRA_BASE_URL,
  restaurantsApiDomain: import.meta.env.VITE_RESTAURANTS_API_DOMAIN,
  // Clear the saved login when the server rejects an expired or invalid token.
  onUnauthorized: () => useAuthStore.getState().clearAuth(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
