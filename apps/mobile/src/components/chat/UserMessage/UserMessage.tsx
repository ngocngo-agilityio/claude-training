import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type UserMessageProps = {
  text: string;
};

/** The user's message: a gradient bubble aligned to the right. */
export const UserMessage = ({ text }: UserMessageProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;

  return (
    <View
      style={[
        styles.bubble,
        {
          experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        },
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-end",
    maxWidth: 280,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 6,
  },
  text: {
    color: "#ffffff",
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  },
});
