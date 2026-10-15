import type { ComponentProps, HTMLAttributes } from "react";
import {
  CopilotChat,
  CopilotChatAssistantMessage,
  type CopilotChatAssistantMessageProps,
  CopilotChatReasoningMessage,
  type CopilotChatReasoningMessageProps,
  CopilotChatUserMessage,
  type CopilotChatUserMessageProps,
} from "@copilotkit/react-core/v2";
import { ChefHat, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/class-name";

type ChatAvatarProps = {
  role: "assistant" | "user";
};

/** Renders the avatar style for each message role. */
const ChatAvatar = ({ role }: ChatAvatarProps) => {
  const isAssistant = role === "assistant";
  const Icon = isAssistant ? ChefHat : UserRound;

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border shadow-sm ring-4 ring-background",
        isAssistant
          ? "border-orange-200/80 bg-orange-500 text-white"
          : "border-border bg-muted text-foreground",
      )}
    >
      <Icon className="size-4.5" />
    </div>
  );
};

const AssistantTypingCursor = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      className={cn("flex items-center pl-12 pt-3", className)}
    >
      <div className="flex h-10 items-center gap-1.5 rounded-2xl rounded-tl-md border bg-card px-4 shadow-sm">
        <span className="sr-only">Assistant is thinking</span>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden="true"
            className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

const AssistantChatMessageComponent = (
  props: CopilotChatAssistantMessageProps,
) => {
  const hasContent = Boolean(props.message.content?.trim());

  return (
    <CopilotChatAssistantMessage {...props}>
      {/* Keep CopilotKit's markdown, tool-call, and toolbar renderers. */}
      {({ markdownRenderer, toolCallsView, toolbar, toolbarVisible }) => (
        <div
          className={cn(
            "group pt-8",
            // Hide the entire assistant row when there is no text or visible
            // tool content. This prevents an empty avatar from appearing.
            !hasContent && "[&:has(.assistant-tool-calls:empty)]:hidden",
          )}
        >
          <div className="flex items-start gap-3">
            <ChatAvatar role="assistant" />

            <div className="min-w-0 flex-1">
              {hasContent && (
                <div className="w-fit max-w-[92%] rounded-3xl rounded-tl-md border border-orange-200/60 bg-orange-50/70 px-5 py-4 text-sm leading-6 shadow-sm dark:border-border/80 dark:bg-card">
                  <div className="prose max-w-none break-words text-foreground dark:prose-invert prose-p:my-0 prose-p:not-first:mt-4 prose-ul:my-4 prose-ul:space-y-1 prose-li:my-0 prose-li:marker:text-orange-500 prose-strong:font-semibold prose-strong:text-foreground">
                    {markdownRenderer}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "assistant-tool-calls empty:hidden",
                  hasContent && "mt-3",
                )}
              >
                {toolCallsView}
              </div>

              {toolbarVisible && (
                <div className="mt-1 opacity-70 transition-opacity group-hover:opacity-100">
                  {toolbar}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CopilotChatAssistantMessage>
  );
};

const ReasoningChatMessageComponent = ({
  message,
  messages = [],
  isRunning,
}: CopilotChatReasoningMessageProps) => {
  const isLatestMessage = messages[messages.length - 1]?.id === message.id;

  // CopilotKit hides its cursor while the latest message is reasoning.
  // Show the same indicator here until the next message arrives or the run ends.
  // CopilotKit wraps its cursor slot in an `mt-2` div, so match that offset.
  return isRunning && isLatestMessage ? (
    <AssistantTypingCursor className="mt-2" />
  ) : null;
};

const ReasoningChatMessage = Object.assign(
  ReasoningChatMessageComponent,
  CopilotChatReasoningMessage,
);

// Copy the default component's static properties so this custom component remains compatible with CopilotKit slots.
export const AssistantChatMessage = Object.assign(
  AssistantChatMessageComponent,
  CopilotChatAssistantMessage,
);

const UserChatMessageComponent = (props: CopilotChatUserMessageProps) => {
  // Customize the bubble while keeping CopilotKit behavior.
  return (
    <CopilotChatUserMessage
      {...props}
      messageRenderer={{
        className:
          "!max-w-full !rounded-2xl !rounded-br-md !bg-gradient-to-br !from-orange-500 !to-rose-500 !px-4 !py-2.5 !text-white shadow-sm",
      }}
    >
      {/* Align the user message and avatar to the right. */}
      {({ messageRenderer, toolbar }) => (
        <article className="group flex flex-col items-end pr-6 pt-8">
          <div className="flex max-w-[85%] items-end gap-3">
            <div className="min-w-0">{messageRenderer}</div>

            <ChatAvatar role="user" />
          </div>

          <div className="mr-11 mt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {toolbar}
          </div>
        </article>
      )}
    </CopilotChatUserMessage>
  );
};

// Copy the default component's static properties so this custom component remains compatible with CopilotKit slots.
export const UserChatMessage = Object.assign(
  UserChatMessageComponent,
  CopilotChatUserMessage,
);

// Configure message renderers by role.
export const chatMessageView: ComponentProps<
  typeof CopilotChat
>["messageView"] = {
  assistantMessage: AssistantChatMessage,
  userMessage: UserChatMessage,
  reasoningMessage: ReasoningChatMessage,
  cursor: AssistantTypingCursor,
  className: "pb-6",
};
