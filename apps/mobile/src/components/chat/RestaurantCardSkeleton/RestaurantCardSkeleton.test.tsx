import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("RestaurantCardSkeleton", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("is fully opaque by default", async () => {
    const { getByLabelText } = await render(<RestaurantCardSkeleton />);

    expect(getByLabelText("Loading restaurant")).toHaveStyle({ opacity: 1 });
  });

  it("fades the card when dimmed", async () => {
    const { getByLabelText } = await render(<RestaurantCardSkeleton dimmed />);

    expect(getByLabelText("Loading restaurant")).toHaveStyle({ opacity: 0.7 });
  });
});
