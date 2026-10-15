export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  CHAT: "/chat",
  CHAT_THREAD: "/chat/:threadId",
};

/** Turns a thread ID into a URL that can be refreshed or bookmarked. */
export const getConversationRoute = (threadId: string) =>
  `${ROUTES.CHAT}/${encodeURIComponent(threadId)}`;
