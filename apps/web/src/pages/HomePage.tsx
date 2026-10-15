import { useParams } from "react-router";
import { RestaurantChat } from "@/components/chat/RestaurantChat";
import { useConversationStore } from "@/stores/conversation-store";

const HomePage = () => {
  const storedActiveThreadId = useConversationStore(
    (state) => state.activeThreadId,
  );
  const { threadId: routeThreadId } = useParams<{ threadId: string }>();
  const activeThreadId = routeThreadId ?? storedActiveThreadId;

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      <section className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-card/80 dark:shadow-[0_20px_55px_rgba(2,8,23,0.22)]">
        <RestaurantChat threadId={activeThreadId} />
      </section>
    </div>
  );
};

export default HomePage;
