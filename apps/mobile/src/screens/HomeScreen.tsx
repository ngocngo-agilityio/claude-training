import { CopilotChat } from "@copilotkit/react-native/components";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { HomeComposer } from "@/components/home/HomeComposer/HomeComposer";
import { HomeHeader } from "@/components/home/HomeHeader/HomeHeader";
import { SuggestionGrid } from "@/components/home/SuggestionGrid/SuggestionGrid";
import { useAuth } from "@/providers/AuthProvider";
import { RestaurantCopilotProvider } from "@/providers/RestaurantCopilotProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize } from "@/theme/typography";

/** Greeting and the time word of the headline, from the hour of the day. */
const getGreeting = (hour: number) => {
  if (hour < 12) return { greeting: "Good morning", when: "today" };
  if (hour < 18) return { greeting: "Good afternoon", when: "today" };
  return { greeting: "Good evening", when: "tonight" };
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

type HomeChatProps = {
  threadId: string;
};

/**
 * The body of the home screen for one thread. Before the first message it
 * shows the greeting, suggestions and input. After that it shows the chat.
 */
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

  // Sends a prompt on this thread. The chat appears once the thread has
  // messages, because the agent state then holds the user's message.
  const sendPrompt = (text: string) => {
    if (!isConnected) return;

    agent.addMessage({ id: createId("user"), role: "user", content: text });
    copilotkit.runAgent({ agent }).catch(() => undefined);
  };

  if (agent.messages.length > 0) {
    return (
      <CopilotChat
        agentName={threadAgentId}
        placeholder="Ask about restaurants…"
        showHeader={false}
      />
    );
  }

  const { greeting, when } = getGreeting(new Date().getHours());

  return (
    <View style={styles.empty}>
      <View style={styles.intro}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          {greeting}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {`Where would you like to eat ${when}?`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.subtle }]}>
          Try one of these
        </Text>
        <SuggestionGrid disabled={!isConnected} onSelect={sendPrompt} />
      </View>

      <View style={styles.bottom}>
        <HomeComposer disabled={!isConnected} onSend={sendPrompt} />
        <Text style={[styles.disclaimer, { color: colors.subtle }]}>
          AI can make mistakes. Please verify important details.
        </Text>
      </View>
    </View>
  );
};

/** Home: the new chat screen with the restaurant assistant. Only shown to signed-in users. */
export const HomeScreen = () => {
  // One thread per "New chat"; kept in memory only.
  const [threadId, setThreadId] = useState(() => createId("thread"));
  const { accessToken, signOut } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // The root layout only mounts this screen while signed in.
  if (!accessToken) return null;

  // The menu drawer of conversations is not built yet. Until it is, the menu
  // offers sign out, which lets the user get past a saved token the server rejects.
  const openMenu = () => {
    Alert.alert("Sign out?", "You will need to sign in again to chat.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <HomeHeader
          onNewChat={() => setThreadId(createId("thread"))}
          onOpenMenu={openMenu}
        />
      </View>
      <RestaurantCopilotProvider accessToken={accessToken}>
        <HomeChat key={threadId} threadId={threadId} />
      </RestaurantCopilotProvider>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 22,
  },
  empty: {
    flex: 1,
    gap: 22,
  },
  intro: {
    gap: 6,
    paddingTop: 8,
  },
  greeting: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.title,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    lineHeight: 16,
    letterSpacing: 1.44,
    textTransform: "uppercase",
  },
  bottom: {
    marginTop: "auto",
    gap: 10,
    paddingBottom: 12,
  },
  disclaimer: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
