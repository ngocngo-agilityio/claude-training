import type { ComponentProps } from "react";
import { ChefHat } from "lucide-react";
import { CopilotChatView } from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils/class-name";

type ChatWelcomeScreenProps = ComponentProps<
  typeof CopilotChatView.WelcomeScreen
>;

export const ChatWelcomeScreen = (props: ChatWelcomeScreenProps) => {
  const { className, input, suggestionView } = props;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col dark:bg-[radial-gradient(circle_at_50%_38%,rgba(249,115,22,0.075),transparent_30%)]",
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-400/25 blur-xl dark:bg-orange-400/20 dark:blur-2xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-500/20">
              <ChefHat aria-hidden="true" className="size-8" />
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            Your restaurant assistant
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Where would you like to eat?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Discover restaurants that match your taste, compare menus, and
            reserve a table—all in one conversation.
          </p>

          <div className="mt-8 w-full">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Try one of these
            </p>
            {suggestionView}
          </div>
        </div>
      </div>

      <div className="shrink-0">{input}</div>
    </div>
  );
};
