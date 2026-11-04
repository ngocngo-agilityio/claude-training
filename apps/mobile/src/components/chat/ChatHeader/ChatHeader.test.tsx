import { fireEvent, render } from "@testing-library/react-native";
import { lightColors } from "@/theme/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { ChatHeader } from "./ChatHeader";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("ChatHeader", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the title and the status line", async () => {
    const { getByText } = await render(
      <ChatHeader status="RestoAI is working…" title="Romantic dinner" />,
    );

    expect(getByText("Romantic dinner")).toBeTruthy();
    expect(getByText("RestoAI is working…")).toBeTruthy();
  });

  it("omits the status line when there is no status", async () => {
    const { queryByText } = await render(<ChatHeader title="New chat" />);

    expect(queryByText("RestoAI is working…")).toBeNull();
  });

  it("calls the menu and options handlers", async () => {
    const onOpenMenu = jest.fn();
    const onOpenOptions = jest.fn();
    const { getByRole } = await render(
      <ChatHeader
        onOpenMenu={onOpenMenu}
        onOpenOptions={onOpenOptions}
        title="New chat"
      />,
    );

    await fireEvent.press(getByRole("button", { name: "Open conversations" }));
    await fireEvent.press(getByRole("button", { name: "Chat options" }));

    expect(onOpenMenu).toHaveBeenCalledTimes(1);
    expect(onOpenOptions).toHaveBeenCalledTimes(1);
  });
});
