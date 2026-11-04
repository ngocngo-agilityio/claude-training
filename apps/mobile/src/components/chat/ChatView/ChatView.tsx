import type { Message } from "@copilotkit/react-native/headless";
import { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";
import { AssistantMessage } from "@/components/chat/AssistantMessage/AssistantMessage";
import { ChatComposer } from "@/components/chat/ChatComposer/ChatComposer";
import { ChatHeader } from "@/components/chat/ChatHeader/ChatHeader";
import { SearchingChip } from "@/components/chat/SearchingChip/SearchingChip";
import { ToolCallMessage } from "@/components/chat/ToolCallMessage/ToolCallMessage";
import { UserMessage } from "@/components/chat/UserMessage/UserMessage";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type ChatViewProps = {
  /** Messages of the open thread, straight from the agent. */
  messages: Message[];
  /** True while the agent is answering. */
  isRunning: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  onOpenMenu?: () => void;
  onOpenOptions?: () => void;
  onViewDetails?: (restaurantId: string) => void;
};

const getText = (content: unknown) =>
  typeof content === "string" ? content.trim() : "";

/** The first thing the user asked, shown as the conversation title. */
const getTitle = (messages: Message[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user");

  return getText(firstUserMessage?.content) || "New chat";
};

/**
 * The chat for one thread: header, messages and the
 * composer. The screen draws every message itself from the agent's messages.
 */
export const ChatView = ({
  messages,
  isRunning,
  onSend,
  onStop,
  onOpenMenu,
  onOpenOptions,
  onViewDetails,
}: ChatViewProps) => {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollViewInstance>(null);

  // The result of each finished tool call, by call ID.
  const toolResults = new Map<string, string>();
  for (const message of messages) {
    if (message.role === "tool") {
      toolResults.set(message.toolCallId, message.content);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const isThinking = isRunning && lastMessage?.role === "user";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ChatHeader
        onOpenMenu={onOpenMenu}
        onOpenOptions={onOpenOptions}
        status={isRunning ? "RestoAI is working…" : "RestoAI"}
        title={getTitle(messages)}
      />

      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        ref={scrollRef}
        style={styles.scroll}
      >
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <UserMessage key={message.id} text={getText(message.content)} />
            );
          }

          if (message.role !== "assistant") return null;

          return (
            <View key={message.id} style={styles.group}>
              <AssistantMessage text={getText(message.content)} />
              {(message.toolCalls ?? []).map((toolCall) => (
                <ToolCallMessage
                  isRunning={isRunning}
                  key={toolCall.id}
                  name={toolCall.function.name}
                  onViewDetails={onViewDetails}
                  result={toolResults.get(toolCall.id)}
                />
              ))}
            </View>
          );
        })}

        {isThinking ? <SearchingChip label="RestoAI is thinking…" /> : null}
      </ScrollView>

      <View style={styles.bottom}>
        <ChatComposer
          isGenerating={isRunning}
          onSend={onSend}
          onStop={onStop}
        />
        <Text style={[styles.disclaimer, { color: colors.subtle }]}>
          AI can make mistakes. Please verify important details.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  list: {
    paddingVertical: 20,
    gap: 18,
  },
  group: {
    gap: 12,
  },
  bottom: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
  },
  disclaimer: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
});
