import { fireEvent, render } from "@testing-library/react-native";
import type { Restaurant } from "@repo/shared/types/restaurant";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { RestaurantCard } from "./RestaurantCard";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const restaurant: Restaurant = {
  id: "r1",
  name: "La Dolce Vita",
  imageUrl: "https://example.com/dolce.jpg",
  rating: 4.7,
  reviewCount: 128,
  location: "Downtown",
  distance: "0.3 km",
  cuisine: "Italian",
  priceRange: "$$$",
  rank: 1,
};

describe("RestaurantCard", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the name, rating, rank and meta line", async () => {
    const { getByText } = await render(
      <RestaurantCard restaurant={restaurant} />,
    );

    expect(getByText("La Dolce Vita")).toBeTruthy();
    expect(getByText("4.7")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
    expect(getByText("(128) · Italian · 0.3 km")).toBeTruthy();
  });

  it("passes the restaurant id when the details button is pressed", async () => {
    const onViewDetails = jest.fn();
    const { getByRole } = await render(
      <RestaurantCard onViewDetails={onViewDetails} restaurant={restaurant} />,
    );

    await fireEvent.press(
      getByRole("button", { name: "View details of La Dolce Vita" }),
    );

    expect(onViewDetails).toHaveBeenCalledWith("r1");
  });
});
