import { fireEvent, render } from "@testing-library/react-native";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import { SuggestionGrid } from "./SuggestionGrid";

describe("SuggestionGrid", () => {
  it("shows one tile per suggestion", async () => {
    const { getAllByRole } = await render(
      <SuggestionGrid onSelect={jest.fn()} />,
    );

    expect(getAllByRole("button")).toHaveLength(
      RESTAURANT_CHAT_SUGGESTIONS.length,
    );
  });

  it("passes the full prompt of the tapped suggestion", async () => {
    const onSelect = jest.fn();
    const { getByRole } = await render(<SuggestionGrid onSelect={onSelect} />);

    await fireEvent.press(
      getByRole("button", { name: "Romantic night, Downtown" }),
    );

    expect(onSelect).toHaveBeenCalledWith(
      "Recommend a romantic restaurant in Downtown for under $60 per person.",
    );
  });

  it("does not call onSelect when disabled", async () => {
    const onSelect = jest.fn();
    const { getByRole } = await render(
      <SuggestionGrid disabled onSelect={onSelect} />,
    );

    await fireEvent.press(
      getByRole("button", { name: "Vegetarian, District 3" }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });
});
