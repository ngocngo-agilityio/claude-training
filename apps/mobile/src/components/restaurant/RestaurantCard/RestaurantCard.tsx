import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import type { Restaurant } from "@repo/shared/types/restaurant";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

/** Width of one card. The carousel uses it to snap from card to card. */
export const RESTAURANT_CARD_WIDTH = 232;

type RestaurantCardProps = {
  restaurant: Restaurant;
  onViewDetails?: (restaurantId: string) => void;
};

/** Card for one restaurant in a search result: photo, rank, rating and a details button. */
export const RestaurantCard = ({
  restaurant,
  onViewDetails,
}: RestaurantCardProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;
  const {
    id,
    name,
    imageUrl,
    rating,
    reviewCount,
    cuisine,
    distance,
    priceRange,
    rank,
  } = restaurant;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.imageBox}>
        <Image
          accessibilityLabel={`${name} photo`}
          source={{ uri: imageUrl }}
          style={styles.image}
        />
        {rank !== undefined ? (
          <View
            style={[
              styles.rank,
              {
                experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              },
            ]}
          >
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: colors.foreground }]}
        >
          {name}
        </Text>

        <View style={styles.metaRow}>
          <Svg aria-hidden height={14} viewBox="0 0 24 24" width={14}>
            <Polygon
              fill={colors.rating}
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </Svg>
          <Text style={[styles.rating, { color: colors.foreground }]}>
            {rating.toFixed(1)}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.meta, { color: colors.mutedForeground }]}
          >
            {`(${reviewCount}) · ${cuisine} · ${distance}`}
          </Text>
        </View>

        <Text style={[styles.price, { color: colors.mutedForeground }]}>
          {`Price range ${priceRange}`}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View details of ${name}`}
          onPress={() => onViewDetails?.(id)}
          style={[styles.detailsButton, { borderColor: colors.brandBorder }]}
        >
          <Text style={[styles.detailsText, { color: colors.brand }]}>
            View details
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: RESTAURANT_CARD_WIDTH,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageBox: {
    height: 128,
  },
  image: {
    width: RESTAURANT_CARD_WIDTH,
    height: 128,
  },
  rank: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#ffffff",
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.caption,
  },
  body: {
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 5,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base - 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rating: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
  },
  meta: {
    flexShrink: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
  price: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
  detailsButton: {
    marginTop: 6,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
});
