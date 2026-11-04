import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { AgentSearchingMessage } from "./AgentSearchingMessage";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("AgentSearchingMessage", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the searching label, two placeholder cards and the caption", async () => {
    const { getAllByLabelText, getByText } = await render(
      <AgentSearchingMessage
        caption="Checking places that are open tonight."
        searchingLabel="Searching restaurants…"
      />,
    );

    expect(getByText("Searching restaurants…")).toBeTruthy();
    expect(getAllByLabelText("Loading restaurant")).toHaveLength(2);
    expect(getByText("Checking places that are open tonight.")).toBeTruthy();
  });
});
