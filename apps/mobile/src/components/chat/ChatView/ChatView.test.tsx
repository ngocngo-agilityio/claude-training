import { fireEvent, render } from "@testing-library/react-native";
import type { Message } from "@copilotkit/react-native/headless";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { useTheme } from "@/providers/ThemeProvider";
import { lightColors } from "@/theme/colors";
import { ChatView } from "./ChatView";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const userMessage = {
  id: "u1",
  role: "user",
  content: "Romantic dinner downtown",
} as Message;

const searchCall = {
  id: "a1",
  role: "assistant",
  content: "",
  toolCalls: [
    {
      id: "call-1",
      type: "function",
      function: { name: TOOL_IDS.RECOMMEND_RESTAURANTS, arguments: "{}" },
    },
  ],
} as Message;

const searchResult = {
  id: "t1",
  role: "tool",
  toolCallId: "call-1",
  content: JSON.stringify({
    success: true,
    data: {
      total: 1,
      restaurants: [
        {
          id: "r1",
          name: "La Dolce Vita",
          imageUrl: "https://example.com/r1.jpg",
          rating: 4.7,
          reviewCount: 128,
          location: "Downtown",
          distance: "0.3 km",
          cuisine: "Italian",
          priceRange: "$$$",
          rank: 1,
        },
      ],
    },
  }),
} as Message;

describe("ChatView", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the first question as the title and the user's message", async () => {
    const { getAllByText } = await render(
      <ChatView
        isRunning={false}
        messages={[userMessage]}
        onSend={jest.fn()}
        onStop={jest.fn()}
      />,
    );

    expect(getAllByText("Romantic dinner downtown")).toHaveLength(2);
  });

  it("shows the search progress while the agent runs the search", async () => {
    const { getByText } = await render(
      <ChatView
        isRunning
        messages={[userMessage, searchCall]}
        onSend={jest.fn()}
        onStop={jest.fn()}
      />,
    );

    expect(getByText("Searching restaurants…")).toBeTruthy();
  });

  it("shows the restaurants when the search is done", async () => {
    const { getByText, queryByRole } = await render(
      <ChatView
        isRunning={false}
        messages={[userMessage, searchCall, searchResult]}
        onSend={jest.fn()}
        onStop={jest.fn()}
      />,
    );

    expect(getByText("La Dolce Vita")).toBeTruthy();
    expect(queryByRole("button", { name: "Book La Dolce Vita" })).toBeNull();
  });

  it("sends the typed text through onSend", async () => {
    const onSend = jest.fn();
    const { getByLabelText, getByRole } = await render(
      <ChatView
        isRunning={false}
        messages={[userMessage]}
        onSend={onSend}
        onStop={jest.fn()}
      />,
    );

    await fireEvent.changeText(getByLabelText("Message"), "Quiet place");
    await fireEvent.press(getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("Quiet place");
  });
});
