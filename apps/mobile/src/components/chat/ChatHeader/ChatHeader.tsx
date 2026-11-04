import { Pressable, StyleSheet, Text, View } from "react-native";
import { EllipsisIcon, MenuIcon } from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type ChatHeaderProps = {
  title: string;
  /** Line under the title, such as the agent's progress. */
  status?: string;
  onOpenMenu?: () => void;
  onOpenOptions?: () => void;
};

/**
 * Chat top bar. Both buttons share the home header's style and size, so the
 * title sits centred between two matching squares.
 */
export const ChatHeader = ({
  title,
  status,
  onOpenMenu,
  onOpenOptions,
}: ChatHeaderProps) => {
  const { colors } = useTheme();
  const buttonStyle = [
    styles.iconButton,
    { backgroundColor: colors.card, borderColor: colors.border },
  ];

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open conversations"
        onPress={onOpenMenu}
        style={buttonStyle}
      >
        <MenuIcon color={colors.foreground} size={20} />
      </Pressable>

      <View style={styles.titleBlock}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.foreground }]}
        >
          {title}
        </Text>
        {status ? (
          <Text style={[styles.status, { color: colors.brand }]}>{status}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chat options"
        onPress={onOpenOptions}
        style={buttonStyle}
      >
        <EllipsisIcon color={colors.foreground} size={20} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 2,
  },
  title: {
    maxWidth: "100%",
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base - 2,
  },
  status: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
});
