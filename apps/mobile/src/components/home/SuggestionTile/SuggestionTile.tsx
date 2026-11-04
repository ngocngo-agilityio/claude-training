import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { fontFamily, fontSize, fontWeight } from "@/theme/typography";

/** Dark fade under the labels so white text stays readable on any photo. */
const SCRIM =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 100%)";

type SuggestionTileProps = {
  label: string;
  subtitle: string;
  image: ImageSourcePropType;
  disabled?: boolean;
  onPress: () => void;
};

/** Photo tile that starts a chat with one suggested restaurant search. */
export const SuggestionTile = ({
  disabled = false,
  image,
  label,
  onPress,
  subtitle,
}: SuggestionTileProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${label}, ${subtitle}`}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.tile,
      disabled ? styles.disabled : null,
      pressed ? styles.pressed : null,
    ]}
  >
    <Image source={image} style={styles.image} />
    <View style={[styles.scrim, { experimental_backgroundImage: SCRIM }]} />
    <View style={styles.labels}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    height: 168,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#1c1917",
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
  },
  labels: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    gap: 1,
  },
  label: {
    color: "#ffffff",
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: 21,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.86)",
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
