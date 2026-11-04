import { fireEvent, render } from "@testing-library/react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { ChatComposer } from "./ChatComposer";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("ChatComposer", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("keeps send disabled until there is text", async () => {
    const { getByRole } = await render(<ChatComposer />);

    expect(getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("sends the trimmed text and clears the input", async () => {
    const onSend = jest.fn();
    const { getByLabelText, getByRole } = await render(
      <ChatComposer onSend={onSend} />,
    );

    await fireEvent.changeText(getByLabelText("Message"), "  Quiet place  ");
    await fireEvent.press(getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("Quiet place");
    expect(getByLabelText("Message").props.value).toBe("");
  });

  it("shows a stop button instead of send while generating", async () => {
    const onStop = jest.fn();
    const { queryByRole, getByRole } = await render(
      <ChatComposer isGenerating onStop={onStop} />,
    );

    expect(queryByRole("button", { name: "Send" })).toBeNull();
    await fireEvent.press(getByRole("button", { name: "Stop generating" }));

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
