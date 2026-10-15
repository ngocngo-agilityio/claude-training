import { ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export const ReservationListEmptyState = () => {
  return (
    <Card className="w-full max-w-2xl gap-0 py-0 shadow-sm">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-400/10 dark:text-orange-300">
          <ListChecks className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold">No reservations yet</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your confirmed restaurant bookings will appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
