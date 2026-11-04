import { render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { UserMessage } from "./UserMessage";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("UserMessage", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the text the user sent", async () => {
    const { getByText } = await render(
      <UserMessage text="Romantic place tonight" />,
    );

    expect(getByText("Romantic place tonight")).toBeTruthy();
  });
});
