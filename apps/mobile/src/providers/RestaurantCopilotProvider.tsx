import { CopilotKitProvider } from "@copilotkit/react-native/headless";
import type { ReactNode } from "react";
import { Alert } from "react-native";
import { API_PATHS } from "@repo/shared/constants/api";
import {
  COPILOTKIT_ERROR_MESSAGES,
  DEFAULT_COPILOTKIT_ERROR_MESSAGE,
} from "@repo/shared/constants/copilotkit-errors";
import { REQUEST_CONTEXT_HEADERS } from "@repo/shared/constants/request-context";
import { MASTRA_BASE_URL } from "@/constants/api";

type RestaurantCopilotProviderProps = {
  /** Token of the signed-in user. The agent rejects requests without it. */
  accessToken: string;
  children: ReactNode;
};

/** Connects the app to the CopilotKit runtime hosted by the Mastra server. */
export const RestaurantCopilotProvider = ({
  accessToken,
  children,
}: RestaurantCopilotProviderProps) => {
  return (
    <CopilotKitProvider
      headers={{
        Authorization: `Bearer ${accessToken}`,
        // The agent uses the device timezone to understand "today" and "7pm".
        [REQUEST_CONTEXT_HEADERS.TIMEZONE]:
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      }}
      onError={({ code }) => {
        Alert.alert(
          "Assistant unavailable",
          COPILOTKIT_ERROR_MESSAGES[code] ?? DEFAULT_COPILOTKIT_ERROR_MESSAGE,
        );
      }}
      runtimeUrl={`${MASTRA_BASE_URL}${API_PATHS.COPILOTKIT}`}
    >
      {children}
    </CopilotKitProvider>
  );
};
