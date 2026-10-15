import { z } from "zod";
import { RESERVATION_WORKFLOW_ERROR_CODES } from "../constants/workflows.ts";

const restaurantCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  // Ratings in the catalog run 0–5, for example 4.7.
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  cuisine: z.string(),
  location: z.string(),
  distance: z.string(),
  priceRange: z.string(),
  rank: z.number().int().min(1),
});

export const recommendRestaurantsInputSchema = z.object({
  cuisine: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .describe("Requested cuisine, for example Italian or Japanese"),
  maximumBudget: z
    .number()
    .positive()
    .optional()
    .describe("Maximum price per person in whole USD"),
  occasion: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .describe(
      "One occasion keyword, for example romantic, family, casual, business or group",
    ),
  location: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Preferred area, for example Downtown or District 1"),
});

const recommendRestaurantsDataSchema = z.object({
  restaurants: z.array(restaurantCardSchema),
  total: z.number().int().min(0),
});

const restaurantDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  restaurantType: z.string(),
  distance: z.string(),
  location: z.string(),
  description: z.string(),
  priceRange: z.string(),
  openingHours: z.string(),
  cuisine: z.string(),
  ambience: z.string(),
  galleryImageUrls: z.array(z.string()).optional(),
  totalPhotoCount: z.number().int().min(0).optional(),
  menuUrl: z.string().optional(),
});

// A restaurant lookup needs at least one identifier. Encoding that here
// rejects an empty call before it reaches the tool's own runtime check.
export const viewRestaurantDetailsInputSchema = z
  .object({
    restaurantId: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Restaurant catalog ID"),
    restaurantName: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Restaurant name mentioned by the user"),
  })
  .refine((value) => Boolean(value.restaurantId || value.restaurantName), {
    message: "Provide a restaurant ID or name.",
  });

const viewRestaurantDetailsDataSchema = z.object({
  restaurant: restaurantDetailSchema,
});

export type ViewRestaurantDetailsData = z.infer<
  typeof viewRestaurantDetailsDataSchema
>;

export const viewRestaurantDetailsOutputSchema = z.object({
  success: z.boolean(),
  data: viewRestaurantDetailsDataSchema.optional(),
  error: z.string().optional(),
});

const restaurantMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  imageUrl: z.string(),
});

const restaurantMenuCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(restaurantMenuItemSchema),
});

export const viewRestaurantMenuInputSchema = z.object({
  restaurantId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe("Restaurant catalog ID"),
  restaurantName: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe("Restaurant name mentioned by the user"),
});

const viewRestaurantMenuDataSchema = z.object({
  restaurantName: z.string(),
  categories: z.array(restaurantMenuCategorySchema),
});

export type ViewRestaurantMenuData = z.infer<
  typeof viewRestaurantMenuDataSchema
>;

export const viewRestaurantMenuOutputSchema = z.object({
  success: z.boolean(),
  data: viewRestaurantMenuDataSchema.optional(),
  error: z.string().optional(),
});

export const listReservationsInputSchema = z.object({});

export const reservationRecordSchema = z.object({
  id: z.coerce.string(),
  restaurantId: z.string(),
  restaurant: z.string(),
  date: z.string(),
  guests: z.number().int().min(1),
  time: z.string(),
  // Add new values here first if a future status is introduced.
  status: z.enum(["Confirmed", "UnConfirmed"]),
});

export type ReservationListItemData = z.infer<typeof reservationRecordSchema>;

const listReservationsDataSchema = z.object({
  reservations: z.array(reservationRecordSchema),
  total: z.number().int().min(0),
});

export type ListReservationsData = z.infer<typeof listReservationsDataSchema>;

export const listReservationsOutputSchema = z.object({
  success: z.boolean(),
  data: listReservationsDataSchema.optional(),
  error: z.string().optional(),
});

const reservationDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const reserveRestaurantInputSchema = z.object({
  restaurantId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe("Restaurant catalog ID"),
  restaurantName: z
    .string()
    .trim()
    .min(1)
    .describe("Restaurant name mentioned by the user"),
  guests: z.number().int().min(1).optional(),
  date: reservationDateSchema
    .describe("Preferred reservation date in YYYY-MM-DD format")
    .optional(),
  time: z
    .string()
    .trim()
    .min(1)
    .describe(
      'Reservation time only, as h:mm AM/PM (e.g. "4:00 PM") - extract just the time, not the surrounding sentence',
    )
    .optional(),
});

const reserveRestaurantDataSchema = z.object({
  restaurantId: z.string(),
  restaurantName: z.string(),
  guests: z.number().int().min(1).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  availableDates: z.array(z.string()),
  opensAt: z.string(),
  closesAt: z.string(),
  maximumGuests: z.number().int().min(1),
});

export type ReserveRestaurantData = z.infer<typeof reserveRestaurantDataSchema>;

export const reserveRestaurantOutputSchema = z.object({
  success: z.boolean(),
  data: reserveRestaurantDataSchema.optional(),
  error: z.string().optional(),
});

export const confirmReservationInputSchema = z.object({
  restaurantId: z.string().trim().min(1).describe("Restaurant catalog ID"),
  restaurantName: z.string().trim().min(1).describe("Restaurant name"),
  guests: z.number().int().min(1).describe("Number of guests"),
  date: reservationDateSchema.describe("Reservation date in YYYY-MM-DD format"),
  time: z
    .string()
    .trim()
    .min(1)
    .describe('Selected reservation time, as h:mm AM/PM (e.g. "7:30 PM")'),
});

export type ConfirmReservationInput = z.infer<
  typeof confirmReservationInputSchema
>;

export type RecommendRestaurantsData = z.infer<
  typeof recommendRestaurantsDataSchema
>;

export const recommendRestaurantsOutputSchema = z.object({
  success: z.boolean(),
  data: recommendRestaurantsDataSchema.optional(),
  error: z.string().optional(),
});

/** Short codes for why the booking failed (or was declined), so the app can
 * show the right message and UI without reading the error text. */
export const reservationWorkflowErrorCodeSchema = z.enum([
  RESERVATION_WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
  RESERVATION_WORKFLOW_ERROR_CODES.CONFLICT,
  RESERVATION_WORKFLOW_ERROR_CODES.DECLINED,
  RESERVATION_WORKFLOW_ERROR_CODES.INTERNAL_ERROR,
]);

/**
 * What the /reservations/review route sends into the workflow to start it.
 *
 * accessToken and userId come from the user's verified login token (set by
 * the route, not sent by the browser), and are carried along so later steps
 * can call the API as that user.
 */
export const reservationBookingWorkflowInputSchema =
  confirmReservationInputSchema.extend({
    // The user's timezone (for example "Asia/Ho_Chi_Minh"), used to check
    // that the date and time are still valid.
    timezone: z.string().trim().min(1),
    accessToken: z.string().min(1),
    userId: z.string().min(1),
  });

/** Successful workflow steps carry complete booking details; failures carry identity. */
const reservationWorkflowIdentitySchema = z.object({
  accessToken: z.string(),
  userId: z.string(),
});

export const reservationWorkflowEnvelopeSchema = z.discriminatedUnion(
  "success",
  [
    reservationWorkflowIdentitySchema.extend({
      success: z.literal(true),
      restaurantId: z.string(),
      restaurantName: z.string(),
      guests: z.number().int().min(1),
      date: z.string(),
      time: z.string(),
    }),
    reservationWorkflowIdentitySchema.extend({
      success: z.literal(false),
      code: reservationWorkflowErrorCodeSchema.optional(),
      error: z.string().optional(),
    }),
  ],
);

export const reservationBookingWorkflowOutputSchema = z.object({
  success: z.boolean(),
  code: reservationWorkflowErrorCodeSchema.optional(),
  error: z.string().optional(),
  reservation: reservationRecordSchema.optional(),
});

/** What the "wait for approval" step sends back while paused, so the review
 * card can show the same details the server just re-checked. */
export const reservationWorkflowSuspendPayloadSchema = z.object({
  restaurantId: z.string(),
  restaurantName: z.string(),
  guests: z.number().int().min(1),
  date: z.string(),
  time: z.string(),
});

/** What the browser sends back to unpause the workflow: whether the user
 * approved or declined the booking. */
export const reservationWorkflowResumeSchema = z.object({
  approved: z.boolean(),
  accessToken: z.string().min(1),
  userId: z.string().min(1),
});

/** The /reservations/review route's response while it is waiting for the
 * user to approve or decline. runId is what /reservations/resume needs to
 * continue this same run later. */
export const reservationReviewPendingSchema = z.object({
  status: z.literal("pending"),
  runId: z.string(),
  reservation: reservationWorkflowSuspendPayloadSchema,
});

/** What the browser sends to /reservations/review to start a run. Same
 * fields the booking needs, plus the timezone used to check the date/time
 * are still valid — accessToken/userId come from the login token instead. */
export const startReservationReviewRequestSchema =
  confirmReservationInputSchema.extend({
    timezone: z.string().trim().min(1),
  });

/** What the browser sends to /reservations/resume to continue a paused run. */
export const resumeReservationReviewRequestSchema = z.object({
  runId: z.string().min(1),
  approved: z.boolean(),
});
