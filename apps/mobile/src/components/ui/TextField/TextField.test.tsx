import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TextField, type TextFieldColors } from "./TextField";

const colors: TextFieldColors = {
  surface: "#ffffff",
  text: "#111827",
  subtle: "#9ca3af",
  border: "#e5e7eb",
  brand: "#e11d48",
  brandRing: "rgba(225, 29, 72, 0.2)",
  destructive: "#dc2626",
};

describe("TextField", () => {
  it("renders the label and forwards text changes", async () => {
    const onChangeText = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TextField colors={colors} label="Email" onChangeText={onChangeText} />,
    );

    expect(getByText("Email")).toBeTruthy();
    await fireEvent.changeText(getByLabelText("Email"), "a@b.com");
    expect(onChangeText).toHaveBeenCalledWith("a@b.com");
  });

  it("shows the error message with an alert role", async () => {
    const { getByRole } = await render(
      <TextField colors={colors} label="Email" error="Email is required" />,
    );

    expect(getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("renders the leading icon and the trailing accessory", async () => {
    const { getByText } = await render(
      <TextField
        colors={colors}
        label="Password"
        icon={<Text>icon</Text>}
        accessory={<Text>toggle</Text>}
      />,
    );

    expect(getByText("icon")).toBeTruthy();
    expect(getByText("toggle")).toBeTruthy();
  });
});
