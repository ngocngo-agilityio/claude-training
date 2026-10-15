import { CheckCircle2 } from "lucide-react";
import { ReservationDetails } from "@/components/reservation/confirmation/ReservationDetails";
import { Card, CardContent } from "@/components/ui/Card";
import type { ConfirmReservationInput } from "@repo/shared/schemas/restaurant";

type ReservationSuccessCardProps = {
  reservation: ConfirmReservationInput;
};

export const ReservationSuccessCard = ({
  reservation,
}: ReservationSuccessCardProps) => {
  return (
    <Card
      className="relative w-full max-w-2xl gap-0 overflow-hidden border-border bg-card py-0 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500"
      role="status"
    >
      <CardContent className="space-y-5 p-5 pl-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Reservation complete
            </p>
            <h3 className="mt-1 text-lg font-bold text-foreground">
              Booking confirmed
            </h3>
            <p className="mt-1 text-sm text-foreground/70">
              Your table at {reservation.restaurantName} has been reserved.
            </p>
          </div>
        </div>

        <ReservationDetails
          date={reservation.date}
          guests={reservation.guests}
          time={reservation.time}
          variant="success"
        />
      </CardContent>
    </Card>
  );
};
