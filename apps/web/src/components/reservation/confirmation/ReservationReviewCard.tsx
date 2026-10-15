import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { ConfirmReservationInput } from "@repo/shared/schemas/restaurant";
import { ReservationDetails } from "@/components/reservation/confirmation/ReservationDetails";

type ReservationReviewCardProps = {
  reservation: ConfirmReservationInput;
  isProcessing: boolean;
  hasReservationConflict: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ReservationReviewCard = ({
  reservation,
  isProcessing,
  hasReservationConflict,
  errorMessage,
  onCancel,
  onConfirm,
}: ReservationReviewCardProps) => {
  return (
    <Card className="w-full max-w-2xl gap-0 rounded-2xl py-0 shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
            Review your reservation
          </p>
          <h3 className="mt-1 text-lg font-bold">
            {reservation.restaurantName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check the details before confirming your table.
          </p>
        </div>

        <ReservationDetails
          date={reservation.date}
          guests={reservation.guests}
          time={reservation.time}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isProcessing} onClick={onCancel} variant="outline">
            {hasReservationConflict ? "Change details" : "Cancel"}
          </Button>
          <Button
            disabled={isProcessing || hasReservationConflict}
            onClick={onConfirm}
          >
            {isProcessing ? "Processing..." : "Confirm booking"}
          </Button>
        </div>

        {errorMessage && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
