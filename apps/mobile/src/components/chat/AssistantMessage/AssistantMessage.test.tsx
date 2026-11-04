import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { AssistantMessage } from "./AssistantMessage";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("AssistantMessage", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the agent's text", async () => {
    const { getByText } = await render(
      <AssistantMessage text="A few options fit." />,
    );

    expect(getByText("A few options fit.")).toBeTruthy();
  });

  it("renders nothing for an empty reply", async () => {
    const { toJSON } = await render(<AssistantMessage text="" />);

    expect(toJSON()).toBeNull();
  });
});
