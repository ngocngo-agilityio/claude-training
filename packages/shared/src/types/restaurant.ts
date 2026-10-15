import { z } from "zod";
import type {
  reservationBookingWorkflowInputSchema,
  reservationBookingWorkflowOutputSchema,
  reservationReviewPendingSchema,
  reservationWorkflowEnvelopeSchema,
  reservationWorkflowErrorCodeSchema,
  reservationWorkflowResumeSchema,
  reservationWorkflowSuspendPayloadSchema,
  resumeReservationReviewRequestSchema,
  startReservationReviewRequestSchema,
} from "../schemas/restaurant.ts";

export type RestaurantBase = {
  id: string;
  name: string;
  imageUrl: string;
};

export type RestaurantSummary = RestaurantBase & {
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
};

export type Restaurant = RestaurantSummary & {
  cuisine: string;
  priceRange: string;
  rank?: number;
  isFavorite?: boolean;
};

export type RestaurantDetail = RestaurantSummary & {
  cuisine: string;
  priceRange: string;
  restaurantType: string;
  description: string;
  openingHours: string;
  ambience: string;
  galleryImageUrls?: string[];
  totalPhotoCount?: number;
  menuUrl?: string;
};

export type RestaurantRecord = RestaurantSummary & {
  cuisines: string[];
  pricePerPerson: number;
  occasions: string[];
  description: string;
  opensAt: string;
  closesAt: string;
  ambience: string;
  galleryImageUrls: string[];
  totalPhotoCount: number;
  maximumReservationGuests: number;
};

export type RestaurantReservationData = {
  restaurantId: string;
  restaurant: string;
  date: string;
  guests: number;
  time: string;
  status: "Confirmed" | "UnConfirmed";
};

export type RestaurantReservation = RestaurantReservationData & {
  userId: string;
};

export type RestaurantReservationRecord = RestaurantReservation & {
  id: string;
};

// Below: plain types inferred from the reservation-booking-workflow Zod
// schemas in ../schemas/restaurant. The schema file keeps validation
// only — the types other code imports live here.
export type ReservationWorkflowErrorCode = z.infer<
  typeof reservationWorkflowErrorCodeSchema
>;

export type ReservationBookingWorkflowInput = z.infer<
  typeof reservationBookingWorkflowInputSchema
>;

export type ReservationWorkflowEnvelope = z.infer<
  typeof reservationWorkflowEnvelopeSchema
>;

export type ReservationBookingWorkflowOutput = z.infer<
  typeof reservationBookingWorkflowOutputSchema
>;

export type ReservationWorkflowSuspendPayload = z.infer<
  typeof reservationWorkflowSuspendPayloadSchema
>;

export type ReservationWorkflowResume = z.infer<
  typeof reservationWorkflowResumeSchema
>;

export type ReservationReviewPending = z.infer<
  typeof reservationReviewPendingSchema
>;

export type StartReservationReviewRequest = z.infer<
  typeof startReservationReviewRequestSchema
>;

export type ResumeReservationReviewRequest = z.infer<
  typeof resumeReservationReviewRequestSchema
>;
