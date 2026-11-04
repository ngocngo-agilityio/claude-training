import { CopilotChat } from "@copilotkit/react-native/components";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import { useAuth } from "@/providers/AuthProvider";
import { RestaurantCopilotProvider } from "@/providers/RestaurantCopilotProvider";
import { useTheme } from "@/providers/ThemeProvider";

type HomeChatProps = {
  threadId: string;
};

/** The prebuilt CopilotChat for the restaurant assistant, bound to one thread. */
const HomeChat = ({ threadId }: HomeChatProps) => {
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

/** Home: one chat with the restaurant assistant. Only shown to signed-in users. */
export const HomeScreen = () => {
  // One thread for the whole app session, kept in memory only.
  const [threadId] = useState(
    () => `thread-${Math.random().toString(36).slice(2)}`,
  );
  const { accessToken, signOut } = useAuth();
  const { colors } = useTheme();

  // The root layout only mounts this screen while signed in.
  if (!accessToken) return null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {/* Sign out lets the user get past a saved token the server rejects. */}
        <Pressable accessibilityRole="button" onPress={signOut} hitSlop={8}>
          <Text style={[styles.signOut, { color: colors.mutedForeground }]}>
            Sign out
          </Text>
        </Pressable>
      </View>
      <RestaurantCopilotProvider accessToken={accessToken}>
        <HomeChat threadId={threadId} />
      </RestaurantCopilotProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
    paddingTop: 64,
  },
  header: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  signOut: {
    fontSize: 14,
  },
});
