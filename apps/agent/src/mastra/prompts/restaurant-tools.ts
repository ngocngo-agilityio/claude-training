export const RESTAURANT_TOOL_RESPONSE_PROMPTS = {
  listReservations:
    "Warmly introduce the reservations using the returned total with natural singular/plural wording, then offer a relevant supported next step. For zero results, say there are no bookings yet and offer to find a restaurant. Avoid bare status messages like 'Your reservations are displayed above'; do not infer dates or upcoming status from the total.",
  recommendRestaurants:
    "Cards already show names, prices and areas, so do not list names or restate the user's filters. One result: invite them to view its details. Multiple: one short, warm line asking which one catches their eye. None: say so and offer to adjust preferences.",
  viewRestaurantDetails:
    "Naturally connect the displayed restaurant to a menu/booking invitation in the user's language. Avoid reciting the card or describing buttons. Continue already-requested actions instead of offering them again.",
  viewRestaurantMenu:
    "Introduce the menu warmly and offer to help book when ready; continue with known details if booking was already requested. Do not invent dishes or repeat the menu.",
  reserveRestaurant:
    "Ask for all missing details, omitting known values: date, time, guests (Markdown list for 2+). Show opening hours only to explain an unavailable time.",
};
