export const TOOL_IDS = {
  CHANGE_THEME: "change_theme",
  SHOW_RESERVATION_GUIDE: "show_reservation_guide",
  RECOMMEND_RESTAURANTS: "recommend_restaurants",
  VIEW_RESTAURANT_DETAILS: "view_restaurant_details",
  VIEW_RESTAURANT_MENU: "view_restaurant_menu",
  LIST_RESERVATIONS: "list_reservations",
  RESERVE_RESTAURANT: "reserve_restaurant",
  CONFIRM_RESERVATION: "confirm_reservation",
} as const;

type ToolMessageMap = Record<string, string>;

export const TOOL_LOADING_MESSAGES: ToolMessageMap = {
  [TOOL_IDS.LIST_RESERVATIONS]: "Loading your reservations...",
  [TOOL_IDS.RECOMMEND_RESTAURANTS]: "Finding the best matches...",
  [TOOL_IDS.RESERVE_RESTAURANT]: "Preparing your reservation...",
  [TOOL_IDS.VIEW_RESTAURANT_DETAILS]: "Loading restaurant details...",
  [TOOL_IDS.VIEW_RESTAURANT_MENU]: "Loading restaurant menu...",
  [TOOL_IDS.CONFIRM_RESERVATION]: "Preparing booking confirmation...",
};

export const TOOL_COMPLETED_MESSAGES: ToolMessageMap = {
  [TOOL_IDS.LIST_RESERVATIONS]: "Reservations loaded",
  [TOOL_IDS.RECOMMEND_RESTAURANTS]: "Restaurant search complete",
  [TOOL_IDS.RESERVE_RESTAURANT]: "Reservation details checked",
  [TOOL_IDS.CONFIRM_RESERVATION]: "Reservation confirmed",
  [TOOL_IDS.VIEW_RESTAURANT_DETAILS]: "Restaurant details loaded",
  [TOOL_IDS.VIEW_RESTAURANT_MENU]: "Menu loaded",
};

export const TOOL_FAILED_MESSAGES = {
  [TOOL_IDS.RESERVE_RESTAURANT]: "Unable to book a table",
  [TOOL_IDS.CONFIRM_RESERVATION]: "Unable to book a table",
} as const;

export const TOOL_CANCELLED_MESSAGES = {
  [TOOL_IDS.CONFIRM_RESERVATION]: "Booking request cancelled",
} as const;
