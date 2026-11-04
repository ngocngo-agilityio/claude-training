import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { ResultsChip } from "./ResultsChip";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("ResultsChip", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the label as plain text when the search succeeded", async () => {
    const { getByText } = await render(
      <ResultsChip label="Found 3 restaurants" variant="success" />,
    );

    expect(getByText("Found 3 restaurants")).toBeTruthy();
  });

  it("shows the label when the search failed", async () => {
    const { getByText } = await render(
      <ResultsChip label="Unable to recommend restaurants" variant="failed" />,
    );

    expect(getByText("Unable to recommend restaurants")).toBeTruthy();
  });
});
