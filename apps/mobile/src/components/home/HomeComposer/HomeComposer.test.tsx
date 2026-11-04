import { fireEvent, render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { HomeComposer } from "./HomeComposer";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("HomeComposer", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: {
        brandGradient: ["#c2410c", "#e11d48"],
        brand: "#c2410c",
        brandMuted: "#ffedd5",
        card: "#ffffff",
        border: "#e7e5e4",
        foreground: "#1c1917",
        subtle: "#78716c",
        shadow: "none",
      },
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("keeps the send button disabled while the input is empty", async () => {
    const { getByRole } = await render(<HomeComposer onSend={jest.fn()} />);

    expect(getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("sends the trimmed text and clears the input", async () => {
    const onSend = jest.fn();
    const { getByLabelText, getByRole } = await render(
      <HomeComposer onSend={onSend} />,
    );

    await fireEvent.changeText(getByLabelText("Message"), "  Sushi near me  ");
    await fireEvent.press(getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("Sushi near me");
    expect(getByLabelText("Message").props.value).toBe("");
  });

  it("does not send when disabled", async () => {
    const onSend = jest.fn();
    const { getByLabelText, getByRole } = await render(
      <HomeComposer disabled onSend={onSend} />,
    );

    await fireEvent.changeText(getByLabelText("Message"), "Sushi");
    await fireEvent.press(getByRole("button", { name: "Send" }));

    expect(onSend).not.toHaveBeenCalled();
  });
});
