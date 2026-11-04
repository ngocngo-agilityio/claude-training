import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type SearchingChipProps = {
  label: string;
};

/** Pill with a spinning ring, shown while the agent is searching. */
export const SearchingChip = ({ label }: SearchingChipProps) => {
  const { colors } = useTheme();
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg aria-hidden height={16} viewBox="0 0 24 24" width={16}>
          <Circle
            cx="12"
            cy="12"
            fill="none"
            r="9"
            stroke={colors.border}
            strokeWidth={3}
          />
          <Path
            d="M12 3a9 9 0 0 1 9 9"
            fill="none"
            stroke={colors.brand}
            strokeLinecap="round"
            strokeWidth={3}
          />
        </Svg>
      </Animated.View>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.label, { color: colors.foreground }]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
});
