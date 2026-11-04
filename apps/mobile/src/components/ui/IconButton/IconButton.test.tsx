import { fireEvent, render } from "@testing-library/react-native";
import { Trash2Icon } from "@/components/icons/Icons/Icons";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("exposes its label as a button and calls onPress", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <IconButton label="Delete" onPress={onPress}>
        <Trash2Icon />
      </IconButton>,
    );

    fireEvent.press(getByRole("button", { name: "Delete" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
