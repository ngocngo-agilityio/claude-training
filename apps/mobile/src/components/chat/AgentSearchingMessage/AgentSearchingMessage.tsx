import { StyleSheet, Text, View } from "react-native";
import { ChefHatIcon } from "@/components/icons/Icons/Icons";
import { RestaurantCardSkeleton } from "@/components/chat/RestaurantCardSkeleton/RestaurantCardSkeleton";
import { SearchingChip } from "@/components/chat/SearchingChip/SearchingChip";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type AgentSearchingMessageProps = {
  searchingLabel: string;
  caption?: string;
};

/** The agent's reply while it searches: avatar, progress chip, placeholder cards. */
export const AgentSearchingMessage = ({
  searchingLabel,
  caption,
}: AgentSearchingMessageProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;

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
        <SearchingChip label={searchingLabel} />

        {/* The second card is cut off at the edge to hint at more results. */}
        <View style={styles.cards}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton dimmed />
        </View>

        {caption ? (
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>
            {caption}
          </Text>
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
  cards: {
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
});
