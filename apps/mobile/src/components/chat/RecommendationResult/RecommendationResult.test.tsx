import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { RecommendationResult } from "./RecommendationResult";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const restaurant = (id: string, name: string, rank: number) => ({
  id,
  name,
  imageUrl: `https://example.com/${id}.jpg`,
  rating: 4.6,
  reviewCount: 20,
  location: "Downtown",
  distance: "0.4 km",
  cuisine: "Italian",
  priceRange: "$$",
  rank,
});

const successResult = JSON.stringify({
  success: true,
  data: {
    total: 2,
    restaurants: [
      restaurant("r1", "La Dolce Vita", 1),
      restaurant("r2", "Le Petit Jardin", 2),
    ],
  },
});

describe("RecommendationResult", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the count and one card per restaurant", async () => {
    const { getByText } = await render(
      <RecommendationResult result={successResult} />,
    );

    expect(getByText("Found 2 restaurants")).toBeTruthy();
    expect(getByText("La Dolce Vita")).toBeTruthy();
    expect(getByText("Le Petit Jardin")).toBeTruthy();
  });

  it("shows the generic failure label instead of the technical error", async () => {
    const { getByText } = await render(
      <RecommendationResult
        result={JSON.stringify({ success: false, error: "Service down" })}
      />,
    );

    expect(getByText("Unable to recommend restaurants")).toBeTruthy();
  });

  it("renders nothing before the tool has a result", async () => {
    const { toJSON } = await render(
      <RecommendationResult result={undefined} />,
    );

    expect(toJSON()).toBeNull();
  });
});
