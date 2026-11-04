import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { Restaurant } from "@repo/shared/types/restaurant";
import {
  RESTAURANT_CARD_WIDTH,
  RestaurantCard,
} from "@/components/restaurant/RestaurantCard/RestaurantCard";
import { useTheme } from "@/providers/ThemeProvider";

const CARD_GAP = 12;
const SNAP_INTERVAL = RESTAURANT_CARD_WIDTH + CARD_GAP;

type RestaurantCarouselProps = {
  restaurants: Restaurant[];
  onViewDetails?: (restaurantId: string) => void;
};

/** Horizontal row of restaurant cards that snaps card by card, with page dots below. */
export const RestaurantCarousel = ({
  restaurants,
  onViewDetails,
}: RestaurantCarouselProps) => {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(
      Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL),
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={handleScrollEnd}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
      >
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            onViewDetails={onViewDetails}
            restaurant={restaurant}
          />
        ))}
      </ScrollView>

      {restaurants.length > 1 ? (
        <View accessibilityElementsHidden style={styles.dots}>
          {restaurants.map((restaurant, index) => {
            const isActive = index === activeIndex;

            return (
              <View
                key={restaurant.id}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : null,
                  {
                    backgroundColor: isActive ? colors.brand : colors.border,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  row: {
    gap: CARD_GAP,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
});
