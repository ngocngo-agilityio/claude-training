export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
};

export type RestaurantMenuCategory = {
  id: string;
  label: string;
  items: RestaurantMenuItem[];
};

export type RestaurantMenuRecord = {
  id: string;
  restaurantId: string;
  categories: RestaurantMenuCategory[];
};
