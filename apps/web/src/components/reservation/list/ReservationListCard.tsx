import { ListChecks } from "lucide-react";
import { ReservationListItem } from "@/components/reservation/list/ReservationListItem";
import { Card, CardContent } from "@/components/ui/Card";
import type { ListReservationsData } from "@repo/shared/schemas/restaurant";

type ReservationListCardProps = {
  data: ListReservationsData;
};

export const ReservationListCard = ({ data }: ReservationListCardProps) => {
  const { reservations, total } = data;

  return (
    <Card className="w-full max-w-2xl gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
      <CardContent className="p-0">
        <div className="relative overflow-hidden border-b bg-gradient-to-r from-orange-50 via-amber-50/60 to-background px-5 py-4 dark:from-orange-400/10 dark:via-amber-400/[0.04] dark:to-transparent">
          <span className="absolute -right-8 -top-12 size-32 rounded-full bg-orange-200/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm shadow-orange-500/20">
              <ListChecks className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                Your bookings
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-foreground">
                {total} {total === 1 ? "reservation" : "reservations"}
              </h3>
            </div>
          </div>
        </div>

        <ul className="space-y-3 bg-muted/15 p-4">
          {reservations.map((reservation) => (
            <ReservationListItem key={reservation.id} {...reservation} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
