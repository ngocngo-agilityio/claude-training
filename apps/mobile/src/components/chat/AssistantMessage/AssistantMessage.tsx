import { StyleSheet, Text, View } from "react-native";
import { ChefHatIcon } from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type AssistantMessageProps = {
  text: string;
};

/** The agent's text reply: avatar on the left and a card-style bubble. Renders nothing when empty. */
export const AssistantMessage = ({ text }: AssistantMessageProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;

  if (!text) return null;

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

      <View
        style={[
          styles.bubble,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.text, { color: colors.foreground }]}>{text}</Text>
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
  bubble: {
    flexShrink: 1,
    maxWidth: 290,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 1,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  },
});
