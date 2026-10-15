import { createWithEqualityFn } from "zustand/traditional";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import {
  // Use a different name because the store has an action with the same name.
  deleteConversation as deleteConversationRequest,
  getConversations,
} from "@repo/shared/services/chat-service";
import type { Conversation } from "@repo/shared/types/conversation";

type ConversationState = {
  activeThreadId: string;
  conversations: Conversation[];
  error: string | null;
  isLoading: boolean;
};

// Functions used to change the conversation data.
type ConversationStore = ConversationState & {
  deleteConversation: (accessToken: string, threadId: string) => Promise<void>;
  loadConversations: (accessToken: string) => Promise<void>;
  clearConversationData: () => void;
  selectConversation: (threadId: string) => void;
  startNewConversation: () => void;
};

// Calling this function creates a new starting state with a new conversation ID.
const createInitialState = (): ConversationState => ({
  activeThreadId: crypto.randomUUID(),
  conversations: [],
  error: null,
  isLoading: true,
});

/** Stores conversation data used by the sidebar and chat. */
export const useConversationStore = createWithEqualityFn<ConversationStore>()(
  (set) => ({
    ...createInitialState(),

    // Load conversations from the server and save them in the store.
    loadConversations: async (accessToken) => {
      // Show the loading state and clear the old error.
      set({ error: null, isLoading: true });

      // Clear the list when the user is not signed in.
      if (!accessToken) {
        set({ conversations: [], isLoading: false });
        return;
      }

      try {
        // The server uses the token to return this user's conversations.
        const { threads } = await getConversations(accessToken);

        // Loading the sidebar must not replace the new empty thread created at
        // startup. Previous conversations are opened only after the user
        // explicitly selects one.
        set({ conversations: threads });
      } catch {
        // Save a message that the sidebar can show to the user.
        set({ error: ERROR_MESSAGES.LOAD_CONVERSATIONS_FAILED });
      } finally {
        // Hide the loading state after the request finishes.
        set({ isLoading: false });
      }
    },

    // Open an empty chat with a new conversation ID.
    startNewConversation: () => {
      set({ activeThreadId: crypto.randomUUID() });
    },

    // Open the conversation selected by the user.
    selectConversation: (threadId) => {
      set({ activeThreadId: threadId });
    },

    // Delete one conversation and remove it from the sidebar.
    deleteConversation: async (accessToken, threadId) => {
      // A signed-in user is required to delete a conversation.
      if (!accessToken) {
        throw new Error(ERROR_MESSAGES.DELETE_CONVERSATION_UNAVAILABLE);
      }

      // Wait until the server deletes it before changing the store.
      await deleteConversationRequest(accessToken, threadId);

      set((state) => {
        // Check if the deleted conversation is open in the chat.
        const isActiveThread = threadId === state.activeThreadId;

        return {
          // Open a new empty chat if the open conversation was deleted.
          activeThreadId: isActiveThread
            ? crypto.randomUUID()
            : state.activeThreadId,

          // Keep every conversation except the deleted one.
          conversations: state.conversations.filter(
            (conversation) => conversation.id !== threadId,
          ),
        };
      });
    },

    // Clear all conversation data and create a new empty chat.
    clearConversationData: () => {
      set(createInitialState());
    },
  }),
);
