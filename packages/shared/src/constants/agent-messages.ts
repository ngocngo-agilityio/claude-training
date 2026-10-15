export const RESTAURANT_AGENT_MESSAGES = {
  viewDetails: (restaurantName: string) =>
    `Show details for ${restaurantName}.`,
  viewMenu: (restaurantName: string) => `Show the menu for ${restaurantName}.`,
  reserveTable: (restaurantName: string) =>
    `Reserve a table at ${restaurantName}.`,
} as const;
