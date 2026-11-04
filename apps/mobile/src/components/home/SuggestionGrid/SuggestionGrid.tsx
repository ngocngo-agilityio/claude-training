import { StyleSheet, View } from "react-native";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import { SUGGESTION_IMAGES } from "@/constants/suggestion-images";
import { SuggestionTile } from "@/components/home/SuggestionTile/SuggestionTile";

type SuggestionGridProps = {
  disabled?: boolean;
  /** Receives the full prompt of the tapped suggestion. */
  onSelect: (message: string) => void;
};

/** Two-column grid of the restaurant suggestions shown on the home screen. */
export const SuggestionGrid = ({
  disabled = false,
  onSelect,
}: SuggestionGridProps) => (
  <View style={styles.grid}>
    {RESTAURANT_CHAT_SUGGESTIONS.map((suggestion) => (
      <SuggestionTile
        key={suggestion.id}
        disabled={disabled}
        image={SUGGESTION_IMAGES[suggestion.id]}
        label={suggestion.label}
        subtitle={suggestion.subtitle}
        onPress={() => onSelect(suggestion.message)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
});
