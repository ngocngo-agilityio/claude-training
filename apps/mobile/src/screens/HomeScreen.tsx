import { CopilotChat } from "@copilotkit/react-native/components";
import { useAgent, useCopilotKit } from "@copilotkit/react-native/headless";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
import { IconButton } from "@/components/ui/IconButton/IconButton";
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

/** Home: the restaurant assistant chat, with a drawer of past conversations. */
export const HomeScreen = () => {
  // The open conversation. A new ID starts an empty chat.
  const [threadId, setThreadId] = useState(createThreadId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Deleted IDs stay out of the list even when a list request that started
  // before the delete finishes after it.
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const { accessToken, signOut } = useAuth();
  const { colors, setTheme, theme } = useTheme();

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

    deletedIdsRef.current.add(conversationId);
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
        <IconButton
          label="Open conversations"
          onPress={() => setIsDrawerOpen(true)}
          style={[
            styles.headerButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MenuIcon color={colors.foreground} size={20} />
        </IconButton>
        <IconButton
          label="New chat"
          onPress={startNewChat}
          style={[
            styles.headerButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <PlusIcon color={colors.foreground} size={20} />
        </IconButton>
      </View>
      <RestaurantCopilotProvider accessToken={accessToken}>
        {/* A new key remounts the chat when the open conversation changes. */}
        <HomeChat key={threadId} threadId={threadId} />
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
    borderWidth: 1,
  },
});
