import { getApiConfig } from "../config/api.ts";
import { API_PATHS } from "../constants/api.ts";
import { httpClient } from "./http-client.ts";
import type { Conversation } from "../types/conversation.ts";

type ResetConversationBody = {
  threadId: string;
};

type ConversationListResponse = {
  threads: Conversation[];
};

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

/** Loads conversations for the signed-in user. */
export const getConversations = (accessToken: string) =>
  httpClient.get<ConversationListResponse>(
    `${getApiConfig().mastraBaseUrl}${API_PATHS.CONVERSATIONS}`,
    { headers: authHeaders(accessToken) },
  );

/** Permanently deletes one conversation. */
export const deleteConversation = (accessToken: string, threadId: string) =>
  httpClient.delete<void>(
    `${getApiConfig().mastraBaseUrl}${API_PATHS.CONVERSATIONS}/${encodeURIComponent(threadId)}`,
    { headers: authHeaders(accessToken) },
  );

/** Deletes the current thread's messages without changing its identity. */
export const resetConversation = (accessToken: string, threadId: string) =>
  httpClient.post<void, ResetConversationBody>(
    `${getApiConfig().mastraBaseUrl}${API_PATHS.RESET_CONVERSATION}`,
    { threadId },
    {
      headers: authHeaders(accessToken),
    },
  );
