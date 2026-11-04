import { fireEvent, render } from "@testing-library/react-native";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { GradientButton } from "./GradientButton";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const mockTheme = (theme: string) =>
  mockedUseTheme.mockReturnValue({
    theme,
    colors: {
      brandGradient: ["#e11d48", "#f97316"],
      brandForeground: "#ffffff",
      mutedForeground: "#6b7280",
      secondary: "#1f2937",
      border: "#374151",
    },
  } as unknown as ReturnType<typeof useTheme>);

describe("GradientButton", () => {
  beforeEach(() => {
    mockTheme(THEMES.LIGHT);
  });

  it("shows the title and calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = await render(
      <GradientButton title="Sign in" onPress={onPress} />,
    );

    expect(getByText("Sign in")).toBeTruthy();
    await fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <GradientButton title="Sign in" disabled onPress={onPress} />,
    );

    await fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("marks the button busy and blocks presses while loading", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <GradientButton title="Signing in..." loading onPress={onPress} />,
    );

    const button = getByRole("button");
    expect(button.props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
