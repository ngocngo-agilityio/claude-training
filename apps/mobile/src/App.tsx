import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { CopilotChat } from "@copilotkit/react-native/components";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import * as NativeSplash from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureApi } from "@repo/shared/config/api";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import { SplashScreen } from "@/components/SplashScreen";
import { MASTRA_BASE_URL, RESTAURANTS_API_DOMAIN } from "@/constants/api";
import { THEMES } from "@/constants/theme";
import { LoginScreen } from "@/screens/LoginScreen";
import { RestaurantCopilotProvider } from "@/providers/RestaurantCopilotProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";

// Keep the native splash up until the in-app splash is drawn over it.
NativeSplash.preventAutoHideAsync().catch(() => undefined);

// Without these, requests go to relative URLs and only fail with a generic
// error, so point the developer at the missing config.
if (__DEV__ && (!MASTRA_BASE_URL || !RESTAURANTS_API_DOMAIN)) {
  console.warn(
    "EXPO_PUBLIC_MASTRA_BASE_URL or EXPO_PUBLIC_RESTAURANTS_API_DOMAIN is missing, see .env.example",
  );
}

// Shared services read their endpoints from this config instead of Expo's env.
configureApi({
  mastraBaseUrl: MASTRA_BASE_URL,
  restaurantsApiDomain: RESTAURANTS_API_DOMAIN,
});

// TODO: Temporary screen to test the CopilotKit integration (chat, switch
// threads). Replace it with the real chat screen.

// Two threads for this app session, to check switching between them.
const THREADS = ["Thread A", "Thread B"].map((name) => ({
  name,
  id: `thread-${Math.random().toString(36).slice(2)}`,
}));

type TestChatProps = {
  threadId: string;
};

/** The prebuilt CopilotChat, bound to one thread. */
const TestChat = ({ threadId }: TestChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { copilotkit } = useCopilotKit();
  const { colors } = useTheme();

  // CopilotChat has no thread prop. Registering a private agent for this
  // thread and passing its ID as `agentName` scopes the chat to the thread.
  const threadAgentId = `${AGENT_IDS.RESTAURANT_RESERVATION}-${threadId}`;
  const { agent, isReady } = useAgent({
    agentId: threadAgentId,
    runtimeAgentId: AGENT_IDS.RESTAURANT_RESERVATION,
    threadId,
  });

  // Load the saved messages of this thread; CopilotChat does not do it. Wait
  // for `isReady`: before that, `agent` is a placeholder for the real agent.
  useEffect(() => {
    if (!isReady) return;

    let isActive = true;

    copilotkit
      .connectAgent({ agent })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) setIsConnected(true);
      });

    return () => {
      isActive = false;
    };
  }, [agent, copilotkit, isReady]);

  // A message sent before the thread is connected is lost.
  if (!isConnected) {
    return <Text style={{ color: colors.mutedForeground }}>Connecting…</Text>;
  }

  return (
    <CopilotChat
      agentName={threadAgentId}
      emptyStateSubtitle="Find, compare, and book in one conversation."
      emptyStateTitle="Where would you like to eat?"
      initialMessages={RESTAURANT_CHAT_SUGGESTIONS.map(
        ({ message }) => message,
      )}
      placeholder="Ask about restaurants…"
      showHeader={false}
    />
  );
};

const TestScreen = () => {
  const [accessToken, setAccessToken] = useState("");
  const [threadId, setThreadId] = useState(THREADS[0].id);
  const { colors } = useTheme();

  // The agent rejects requests without a user token, so sign in first.
  if (!accessToken) {
    return (
      <LoginScreen
        onLoginSuccess={(data) => setAccessToken(data.accessToken)}
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.threads}>
        {THREADS.map(({ id, name }) => (
          <Button
            disabled={id === threadId}
            key={id}
            onPress={() => setThreadId(id)}
            title={name}
          />
        ))}
      </View>
      <RestaurantCopilotProvider accessToken={accessToken}>
        {/* Remount the chat when the thread changes. */}
        <TestChat key={threadId} threadId={threadId} />
      </RestaurantCopilotProvider>
    </View>
  );
};

/** The app screen, with the splash drawn over it until it fades away. */
const AppContent = () => {
  const { theme } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const handleSplashFinish = useCallback(() => setIsSplashVisible(false), []);

  return (
    <>
      <TestScreen />
      {isSplashVisible && <SplashScreen onFinish={handleSplashFinish} />}
      <StatusBar style={theme === THEMES.DARK ? "light" : "dark"} />
    </>
  );
};

export const App = () => {
  const [areFontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // The native splash stays up while the fonts load.
  if (!areFontsLoaded && !fontError) return null;

  return (
    // The prebuilt CopilotKit chat components need the gesture handler root.
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
    gap: 12,
    padding: 16,
    paddingTop: 64,
  },
  threads: {
    flexDirection: "row",
    gap: 8,
  },
});
