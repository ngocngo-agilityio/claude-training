import { fireEvent, render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { HomeHeader } from "./HomeHeader";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("HomeHeader", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: {
        brandGradient: ["#c2410c", "#e11d48"],
        card: "#ffffff",
        border: "#e7e5e4",
        foreground: "#1c1917",
      },
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the brand name", async () => {
    const { getByText } = await render(
      <HomeHeader onNewChat={jest.fn()} onOpenMenu={jest.fn()} />,
    );

    expect(getByText("RestoAI")).toBeTruthy();
  });

  it("calls onOpenMenu when the menu button is pressed", async () => {
    const onOpenMenu = jest.fn();
    const { getByRole } = await render(
      <HomeHeader onNewChat={jest.fn()} onOpenMenu={onOpenMenu} />,
    );

    await fireEvent.press(getByRole("button", { name: "Menu" }));
    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });

  it("calls onNewChat when the new chat button is pressed", async () => {
    const onNewChat = jest.fn();
    const { getByRole } = await render(
      <HomeHeader onNewChat={onNewChat} onOpenMenu={jest.fn()} />,
    );

    await fireEvent.press(getByRole("button", { name: "New chat" }));
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });
});
