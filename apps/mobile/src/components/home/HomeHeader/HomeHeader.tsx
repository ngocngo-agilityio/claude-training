import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChefHatIcon,
  MenuIcon,
  NewChatIcon,
} from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily } from "@/theme/typography";

type HomeHeaderProps = {
  onOpenMenu: () => void;
  onNewChat: () => void;
};

/** Top bar of the home screen: menu on the left, brand in the middle, new chat on the right. */
export const HomeHeader = ({ onNewChat, onOpenMenu }: HomeHeaderProps) => {
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Menu"
        onPress={onOpenMenu}
        style={[
          styles.iconButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <MenuIcon color={colors.foreground} size={20} />
      </Pressable>

      <View style={styles.brand}>
        <View
          style={[
            styles.logo,
            {
              experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            },
          ]}
        >
          <ChefHatIcon color="#ffffff" size={16} />
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          RestoAI
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New chat"
        onPress={onNewChat}
        style={[
          styles.iconButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <NewChatIcon color={colors.foreground} size={20} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
});
