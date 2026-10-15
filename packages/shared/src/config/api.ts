type ApiConfig = {
  /** Base URL of the Mastra server that hosts the agent and its custom routes. */
  mastraBaseUrl: string;
  /** Base URL of the restaurants REST API. */
  restaurantsApiDomain: string;
  /** Runs when a request is rejected with 401, so the app can sign the user out. */
  onUnauthorized?: () => void;
};

let apiConfig: ApiConfig = {
  mastraBaseUrl: "",
  restaurantsApiDomain: "",
};

/**
 * Sets the API endpoints used by the shared services.
 *
 * Environment variables are read differently on each platform (Vite, Expo,
 * Node), so every app calls this once at startup with its own values instead
 * of the shared package reading them.
 */
export const configureApi = (config: Partial<ApiConfig>) => {
  apiConfig = { ...apiConfig, ...config };
};

export const getApiConfig = () => apiConfig;
