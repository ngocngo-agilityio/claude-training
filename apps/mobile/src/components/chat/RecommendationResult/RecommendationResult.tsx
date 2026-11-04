import { StyleSheet, View } from "react-native";
import { ChefHatIcon } from "@/components/icons/Icons/Icons";
import { ResultsChip } from "@/components/chat/ResultsChip/ResultsChip";
import { RestaurantCarousel } from "@/components/restaurant/RestaurantCarousel/RestaurantCarousel";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { recommendRestaurantsOutputSchema } from "@repo/shared/schemas/restaurant";
import { getToolFailureStatus } from "@repo/shared/utils/tool-status";
import { parseToolResult } from "@repo/shared/utils/tool";
import { useTheme } from "@/providers/ThemeProvider";

type RecommendationResultProps = {
  /** Result of the recommend_restaurants tool: a JSON string or the parsed object. */
  result: unknown;
  onViewDetails?: (restaurantId: string) => void;
};

/** The agent's reply with the restaurants it found: outcome chip, then the carousel. */
export const RecommendationResult = ({
  result,
  onViewDetails,
}: RecommendationResultProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;

  // Nothing to show until the tool has produced a result.
  if (result === undefined || result === "") return null;

  const parsed = recommendRestaurantsOutputSchema.safeParse(
    typeof result === "string" ? parseToolResult(result) : result,
  );
  const restaurants =
    parsed.success && parsed.data.success && parsed.data.data
      ? parsed.data.data.restaurants
      : null;

  let chip: React.ReactNode;
  if (restaurants === null) {
    chip = (
      <ResultsChip
        label={getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          ERROR_MESSAGES.RECOMMEND_RESTAURANTS_FAILED,
        )}
        variant="failed"
      />
    );
  } else if (restaurants.length === 0) {
    chip = <ResultsChip label="No restaurants found" variant="failed" />;
  } else {
    const count = restaurants.length;
    chip = (
      <ResultsChip
        label={`Found ${count} ${count === 1 ? "restaurant" : "restaurants"}`}
        variant="success"
      />
    );
  }

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.avatar,
          {
            experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          },
        ]}
      >
        <ChefHatIcon color="#ffffff" size={18} />
      </View>

      <View style={styles.content}>
        {chip}
        {restaurants && restaurants.length > 0 ? (
          <RestaurantCarousel
            onViewDetails={onViewDetails}
            restaurants={restaurants}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
});
