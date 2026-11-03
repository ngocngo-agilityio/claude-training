import { render } from "@testing-library/react-native";
import { Text } from "react-native";

describe("test runner", () => {
  test("renders a text node with RNTL", async () => {
    const { getByText } = await render(<Text>Xin chào RestoAI</Text>);

    expect(getByText("Xin chào RestoAI")).toBeTruthy();
  });
});
