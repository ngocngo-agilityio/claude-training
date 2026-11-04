import { StyleSheet, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

type RestaurantCardSkeletonProps = {
  /** Fades the card, used for the card that is further away in the row. */
  dimmed?: boolean;
};

/** Placeholder for a restaurant card while the agent is still searching. */
export const RestaurantCardSkeleton = ({
  dimmed = false,
}: RestaurantCardSkeletonProps) => {
  const { colors } = useTheme();

  return (
    <View
      accessibilityLabel="Loading restaurant"
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: dimmed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.image, { backgroundColor: colors.skeleton }]} />
      <View style={styles.body}>
        <View
          style={[
            styles.bar,
            styles.titleBar,
            { backgroundColor: colors.skeleton },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.metaBar,
            { backgroundColor: colors.skeleton },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.lineBar,
            { backgroundColor: colors.skeleton },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    flexShrink: 0,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    height: 128,
  },
  body: {
    padding: 14,
    gap: 10,
  },
  bar: {
    borderRadius: 6,
  },
  titleBar: {
    width: 140,
    height: 14,
    borderRadius: 7,
  },
  metaBar: {
    width: 90,
    height: 12,
  },
  lineBar: {
    width: 170,
    height: 12,
  },
});
