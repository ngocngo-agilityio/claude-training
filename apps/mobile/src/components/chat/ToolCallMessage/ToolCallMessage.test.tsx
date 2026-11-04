import { render } from "@testing-library/react-native";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { ToolCallMessage } from "./ToolCallMessage";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const successResult = JSON.stringify({
  success: true,
  data: {
    total: 1,
    restaurants: [
      {
        id: "r1",
        name: "La Dolce Vita",
        imageUrl: "https://example.com/r1.jpg",
        rating: 4.7,
        reviewCount: 128,
        location: "Downtown",
        distance: "0.3 km",
        cuisine: "Italian",
        priceRange: "$$$",
        rank: 1,
      },
    ],
  },
});

describe("ToolCallMessage", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the searching state while the restaurant search runs", async () => {
    const { getByText } = await render(
      <ToolCallMessage isRunning name={TOOL_IDS.RECOMMEND_RESTAURANTS} />,
    );

    expect(getByText("Searching restaurants…")).toBeTruthy();
  });

  it("shows the restaurants once the search has a result", async () => {
    const { getByText } = await render(
      <ToolCallMessage
        isRunning={false}
        name={TOOL_IDS.RECOMMEND_RESTAURANTS}
        result={successResult}
      />,
    );

    expect(getByText("Found 1 restaurant")).toBeTruthy();
    expect(getByText("La Dolce Vita")).toBeTruthy();
  });

  it("renders nothing for other tools once they finish", async () => {
    const { toJSON } = await render(
      <ToolCallMessage
        isRunning={false}
        name={TOOL_IDS.LIST_RESERVATIONS}
        result="{}"
      />,
    );

    expect(toJSON()).toBeNull();
  });
});
