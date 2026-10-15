import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChefHat,
  ChevronDown,
  CircleUserRound,
  House,
  LogOut,
  MessageSquare,
  Plus,
} from "lucide-react";
import { DeleteConversationButton } from "@/components/chat/DeleteConversationButton";
import { useLocation, useNavigate, useParams } from "react-router";
import { shallow } from "zustand/shallow";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar";
import { getConversationRoute, ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/class-name";
import { useAuthStore } from "@/stores/auth-store";
import { useConversationStore } from "@/stores/conversation-store";

type NavigationItem = {
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
};

type AppLayoutProps = {
  children: ReactNode;
};

// Main links displayed at the top of the sidebar.
const navigation: NavigationItem[] = [
  {
    title: "Home",
    url: ROUTES.CHAT,
    description: "Find and reserve the perfect table with your AI assistant.",
    icon: House,
  },
];

/** Displays the app sidebar, page header, and current page content. */
export const AppLayout = ({ children }: AppLayoutProps) => {
  // Get the signed-in user data and sign-out action from the auth store.
  const [accessToken, user, clearAuth] = useAuthStore(
    (state) => [state.accessToken, state.user, state.clearAuth],
    shallow,
  );
  const navigate = useNavigate();

  // Get the conversation data and actions needed by the sidebar.
  const {
    activeThreadId: storedActiveThreadId,
    conversations,
    deleteConversation,
    error: conversationsError,
    isLoading: areConversationsLoading,
    selectConversation,
    startNewConversation,
  } = useConversationStore(
    (state) => ({
      activeThreadId: state.activeThreadId,
      conversations: state.conversations,
      deleteConversation: state.deleteConversation,
      error: state.error,
      isLoading: state.isLoading,
      selectConversation: state.selectConversation,
      startNewConversation: state.startNewConversation,
    }),
    shallow,
  );

  // A saved chat stores its ID in the URL. A new chat has no URL ID yet, so
  // it temporarily uses the random ID created by the Zustand store.
  const { threadId: routeThreadId } = useParams<{ threadId: string }>();
  const activeThreadId = routeThreadId ?? storedActiveThreadId;

  // Find the current route so the matching link and page title can be shown.
  const { pathname } = useLocation();
  const activeItem = navigation.find((item) => item.url === pathname);

  // Use empty text while user data is not available.
  const { fullName = "", email = "" } = user ?? {};

  // Start an empty conversation and open the chat page.
  const handleNewChat = () => {
    startNewConversation();
    navigate(ROUTES.CHAT);
  };

  // Put the selected thread ID in the URL. The browser can now remember which
  // conversation to reopen after the user refreshes the page.
  const handleSelectConversation = (threadId: string) => {
    selectConversation(threadId);
    navigate(getConversationRoute(threadId));
  };

  // Leave the selected thread before its deletion starts, so the chat never
  // points at a thread that has already been removed from storage.
  const handleDeleteConversation = async (threadId: string) => {
    if (threadId === activeThreadId) {
      startNewConversation();
      navigate(ROUTES.CHAT, { replace: true });
    }

    await deleteConversation(accessToken, threadId);
  };

  return (
    // Share the sidebar open and closed state with all sidebar components.
    <SidebarProvider style={{ "--sidebar-width": "15rem" } as CSSProperties}>
      <Sidebar
        className="border-r border-slate-200 bg-white dark:border-white/10 dark:bg-sidebar dark:shadow-[8px_0_30px_rgba(2,8,23,0.16)]"
        variant="sidebar"
      >
        {/* Show the app name and the button for starting a new chat. */}
        <SidebarHeader className="gap-5 px-4 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400">
              <ChefHat className="size-6" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                RestoAI
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Dining Assistant
              </p>
            </div>
          </div>

          <Button
            className="h-12 w-full"
            onClick={handleNewChat}
            variant="primary"
          >
            <Plus className="size-5" />
            New Chat
          </Button>
        </SidebarHeader>

        <SidebarContent className="gap-0 px-3">
          {/* Show the conversation loading, empty, error, and list states. */}
          <SidebarGroup className="min-h-0 flex-1 gap-2 p-0 pt-5">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversations
            </p>

            {!areConversationsLoading && conversations.length === 0 && (
              <p className="px-3 py-2 text-xs leading-5 text-slate-500">
                Your conversations will appear here.
              </p>
            )}

            {conversationsError && (
              <p className="px-3 py-2 text-xs text-red-500" role="alert">
                {conversationsError}
              </p>
            )}

            {/* Keep long conversation lists scrollable inside the sidebar. */}
            <div className="flex min-h-0 flex-col gap-1 overflow-y-auto pb-3">
              {conversations.map((conversation) => {
                // Prepare the title and check whether this conversation is open.
                const title = conversation.title?.trim() || "New conversation";
                const isActive = conversation.id === activeThreadId;

                return (
                  <div
                    className={cn(
                      "group/conversation flex items-center rounded-lg pr-1 hover:bg-orange-50 dark:hover:bg-orange-400/10",
                      isActive &&
                        "bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300",
                    )}
                    key={conversation.id}
                  >
                    <Button
                      className="h-10 min-w-0 flex-1 justify-start gap-2 px-3 text-left font-normal"
                      onClick={() => handleSelectConversation(conversation.id)}
                      title={title}
                      variant="ghost"
                    >
                      <MessageSquare className="size-4 shrink-0" />
                      <span className="truncate text-xs">{title}</span>
                    </Button>
                    <DeleteConversationButton
                      conversationTitle={title}
                      onDelete={() => handleDeleteConversation(conversation.id)}
                    />
                  </div>
                );
              })}
            </div>
          </SidebarGroup>
        </SidebarContent>

        {/* Show the signed-in user and sign-out button. */}
        <SidebarFooter className="gap-3 px-4 pb-5">
          <Button
            className="h-auto w-full justify-start gap-2.5 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-sm hover:border-slate-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/70 dark:shadow-none dark:hover:border-slate-600 dark:hover:bg-slate-800"
            variant="ghost"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400">
              <CircleUserRound className="size-7" />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-800" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {fullName}
              </span>
              <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
                {email}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-500 dark:text-slate-400" />
          </Button>

          <Button
            className="h-auto justify-start gap-2 self-start px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600"
            onClick={clearAuth}
            variant="ghost"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Display the header and selected page beside the sidebar. */}
      <SidebarInset className="dark:bg-[radial-gradient(circle_at_85%_0%,rgba(249,115,22,0.055),transparent_28%),linear-gradient(to_bottom,var(--background),oklch(0.165_0.026_258))]">
        <header className="flex h-24 shrink-0 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                {pathname === ROUTES.CHAT
                  ? "AI Restaurant Reservation Assistant"
                  : (activeItem?.title ??
                    "AI Restaurant Reservation Assistant")}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {activeItem?.description ??
                  "Find, book, and enjoy the perfect dining experience."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
