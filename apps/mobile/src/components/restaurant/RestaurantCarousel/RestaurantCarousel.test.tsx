import { fireEvent, render } from "@testing-library/react-native";
import type { Restaurant } from "@repo/shared/types/restaurant";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { RestaurantCarousel } from "./RestaurantCarousel";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const makeRestaurant = (
  id: string,
  name: string,
  rank: number,
): Restaurant => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.jpg`,
  rating: 4.5,
  reviewCount: 10,
  location: "Downtown",
  distance: "0.5 km",
  cuisine: "French",
  priceRange: "$$",
  rank,
});

describe("RestaurantCarousel", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("renders one card per restaurant and reports the pressed id", async () => {
    const onViewDetails = jest.fn();
    const { getByText, getByRole } = await render(
      <RestaurantCarousel
        onViewDetails={onViewDetails}
        restaurants={[
          makeRestaurant("r1", "La Dolce Vita", 1),
          makeRestaurant("r2", "Le Petit Jardin", 2),
        ]}
      />,
    );

    expect(getByText("La Dolce Vita")).toBeTruthy();
    expect(getByText("Le Petit Jardin")).toBeTruthy();

    await fireEvent.press(
      getByRole("button", { name: "View details of Le Petit Jardin" }),
    );

    expect(onViewDetails).toHaveBeenCalledWith("r2");
  });
});
