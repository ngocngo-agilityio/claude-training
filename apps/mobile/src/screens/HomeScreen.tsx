import { CopilotChat } from "@copilotkit/react-native/components";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import {
  deleteConversation,
  getConversations,
} from "@repo/shared/services/chat-service";
import type { Conversation } from "@repo/shared/types/conversation";
import { ConversationDrawer } from "@/components/ConversationDrawer/ConversationDrawer";
import { MenuIcon, PlusIcon } from "@/components/icons/Icons/Icons";
import { THEMES } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { RestaurantCopilotProvider } from "@/providers/RestaurantCopilotProvider";
import { useTheme } from "@/providers/ThemeProvider";

/** A new id for an empty chat; the server keeps it once a message is sent. */
const createThreadId = () => `thread-${Math.random().toString(36).slice(2)}`;

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

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  children: ReactNode;
};

/** Square icon button in the Home header. */
const HeaderButton = ({ children, label, onPress }: HeaderButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
};

/** Home: the restaurant assistant chat, with a drawer of past conversations. */
export const HomeScreen = () => {
  // The open conversation. A new ID starts an empty chat.
  const [threadId, setThreadId] = useState(createThreadId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { accessToken, signOut } = useAuth();
  const { colors, setTheme, theme } = useTheme();

  // Reload the list each time the drawer opens, so it includes new chats.
  useEffect(() => {
    if (!isDrawerOpen || !accessToken) return;

    let isActive = true;

    getConversations(accessToken)
      .then(({ threads }) => {
        if (!isActive) return;
        setConversations(threads);
        setLoadError(null);
      })
      .catch(() => {
        if (isActive) setLoadError(ERROR_MESSAGES.LOAD_CONVERSATIONS_FAILED);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, isDrawerOpen]);

  const startNewChat = () => {
    setThreadId(createThreadId());
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

    setConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId),
    );
    // Deleting the open chat leaves an empty chat in its place.
    setThreadId((current) =>
      current === conversationId ? createThreadId() : current,
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <HeaderButton
          label="Open conversations"
          onPress={() => setIsDrawerOpen(true)}
        >
          <MenuIcon color={colors.foreground} size={20} />
        </HeaderButton>
        <HeaderButton label="New chat" onPress={startNewChat}>
          <PlusIcon color={colors.foreground} size={20} />
        </HeaderButton>
      </View>
      <RestaurantCopilotProvider accessToken={accessToken}>
        {/* A new key remounts the chat when the open conversation changes. */}
        <HomeChat key={threadId} threadId={threadId} />
      </RestaurantCopilotProvider>
      <ConversationDrawer
        activeThreadId={threadId}
        conversations={conversations}
        error={loadError}
        isDark={theme === THEMES.DARK}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDelete={confirmDelete}
        onNewChat={startNewChat}
        onSelect={selectConversation}
        onSignOut={signOut}
        onToggleTheme={toggleTheme}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
