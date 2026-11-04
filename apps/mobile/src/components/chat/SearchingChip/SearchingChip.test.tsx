import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { SearchingChip } from "./SearchingChip";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("SearchingChip", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the searching label as a polite live region", async () => {
    const { getByText } = await render(
      <SearchingChip label="Searching restaurants…" />,
    );

    expect(
      getByText("Searching restaurants…").props.accessibilityLiveRegion,
    ).toBe("polite");
  });
});
