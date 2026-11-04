import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { useEffect, useRef, useState } from "react";
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
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import {
  deleteConversation,
  getConversations,
} from "@repo/shared/services/chat-service";
import type { Conversation } from "@repo/shared/types/conversation";
import { ChatView } from "@/components/chat/ChatView/ChatView";
import { ConversationDrawer } from "@/components/ConversationDrawer/ConversationDrawer";
import { HomeComposer } from "@/components/home/HomeComposer/HomeComposer";
import { HomeHeader } from "@/components/home/HomeHeader/HomeHeader";
import { SuggestionGrid } from "@/components/home/SuggestionGrid/SuggestionGrid";
import { THEMES } from "@/constants/theme";
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
  onOpenMenu: () => void;
  onNewChat: () => void;
};

/**
 * The body of the home screen for one thread. Before the first message it
 * shows the greeting, suggestions and input. After that it shows the chat.
 */
const HomeChat = ({ threadId, onOpenMenu, onNewChat }: HomeChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { copilotkit } = useCopilotKit();
  const { colors } = useTheme();

  // Registering a private agent for this thread and using its ID scopes the
  // conversation to the thread.
  const threadAgentId = `${AGENT_IDS.RESTAURANT_RESERVATION}-${threadId}`;
  const { agent, isReady } = useAgent({
    agentId: threadAgentId,
    runtimeAgentId: AGENT_IDS.RESTAURANT_RESERVATION,
    threadId,
  });

  // Load the saved messages of this thread. Wait for `isReady`: before that,
  // `agent` is a placeholder for the real agent.
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

  const stopAgent = () => {
    copilotkit.stopAgent({ agent });
  };

  if (agent.messages.length > 0) {
    return (
      <ChatView
        isRunning={agent.isRunning}
        messages={agent.messages}
        onOpenMenu={onOpenMenu}
        onSend={sendPrompt}
        onStop={stopAgent}
        onViewDetails={(restaurantId) =>
          sendPrompt(`Show the details of restaurant with id ${restaurantId}`)
        }
      />
    );
  }

  const { greeting, when } = getGreeting(new Date().getHours());

  return (
    <View style={styles.empty}>
      <View style={styles.header}>
        <HomeHeader onNewChat={onNewChat} onOpenMenu={onOpenMenu} />
      </View>

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

/** Home: the restaurant assistant chat, with a drawer of past conversations. Only shown to signed-in users. */
export const HomeScreen = () => {
  // The open conversation. A new ID starts an empty chat.
  const [threadId, setThreadId] = useState(() => createId("thread"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Deleted IDs stay out of the list even when a list request that started
  // before the delete finishes after it.
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const { accessToken, signOut } = useAuth();
  const { colors, setTheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Reload the list each time the drawer opens, so it includes new chats.
  // Closing the drawer does not cancel the request: its result is still valid.
  useEffect(() => {
    if (!isDrawerOpen || !accessToken) return;

    getConversations(accessToken)
      .then(({ threads }) => {
        setConversations(
          threads.filter((thread) => !deletedIdsRef.current.has(thread.id)),
        );
        setLoadError(null);
      })
      .catch(() => {
        setLoadError(ERROR_MESSAGES.LOAD_CONVERSATIONS_FAILED);
      });
  }, [accessToken, isDrawerOpen]);

  const startNewChat = () => {
    setThreadId(createId("thread"));
    setIsDrawerOpen(false);
  };

  const selectConversation = (selectedThreadId: string) => {
    setThreadId(selectedThreadId);
    setIsDrawerOpen(false);
  };

  const removeConversation = async (conversationId: string) => {
    if (!accessToken) return;

    try {
      await deleteConversation(accessToken, conversationId);
    } catch {
      Alert.alert(ERROR_MESSAGES.DELETE_CONVERSATION_FAILED);
      return;
    }

    deletedIdsRef.current.add(conversationId);
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId),
    );
    // Deleting the open chat leaves an empty chat in its place.
    setThreadId((current) =>
      current === conversationId ? createId("thread") : current,
    );
  };

  const confirmDelete = (conversationId: string) => {
    Alert.alert(
      "Delete conversation?",
      "This conversation and all its messages will be permanently deleted. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void removeConversation(conversationId),
        },
      ],
    );
  };

  const toggleTheme = () => {
    setTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  // The root layout only mounts this screen while signed in.
  if (!accessToken) return null;

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
      <RestaurantCopilotProvider accessToken={accessToken}>
        {/* A new key remounts the chat when the open conversation changes. */}
        <HomeChat
          key={threadId}
          onNewChat={startNewChat}
          onOpenMenu={() => setIsDrawerOpen(true)}
          threadId={threadId}
        />
      </RestaurantCopilotProvider>
      <ConversationDrawer
        activeThreadId={threadId}
        conversations={conversations}
        error={loadError}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDelete={confirmDelete}
        onNewChat={startNewChat}
        onSelect={selectConversation}
        onSignOut={signOut}
        onToggleTheme={toggleTheme}
      />
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
