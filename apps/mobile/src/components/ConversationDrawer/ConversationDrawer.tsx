import type { Conversation } from "@repo/shared/types/conversation";
import { useEffect } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  ChefHatIcon,
  LogOutIcon,
  MessageIcon,
  MoonIcon,
  SunIcon,
  Trash2Icon,
} from "@/components/icons/Icons/Icons";
import { GradientButton } from "@/components/ui/GradientButton/GradientButton";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

/** Width of the panel, from the Drawer artboard of the RestoAI design. */
const DRAWER_WIDTH = 318;
const ANIMATION_DURATION_MS = 250;
const UNTITLED_CONVERSATION = "Untitled conversation";

export type ConversationDrawerProps = {
  isOpen: boolean;
  conversations: Conversation[];
  activeThreadId: string;
  /** Message shown in place of the list when the conversations fail to load. */
  error: string | null;
  onClose: () => void;
  onNewChat: () => void;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
};

/**
 * Slide-in panel from the left with the conversation list, a new-chat button
 * and the account footer. Tapping the scrim or the Android back button closes it.
 */
export const ConversationDrawer = ({
  activeThreadId,
  conversations,
  error,
  isOpen,
  onClose,
  onDelete,
  onNewChat,
  onSelect,
  onSignOut,
  onToggleTheme,
}: ConversationDrawerProps) => {
  const { colors, theme } = useTheme();
  const isDark = theme === THEMES.DARK;
  const reduceMotion = useReducedMotion();
  // 0 when closed, 1 when open. The panel and the scrim both read it.
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration: reduceMotion ? 0 : ANIMATION_DURATION_MS,
    });
  }, [isOpen, progress, reduceMotion]);

  // While open, the Android back button closes the drawer instead of leaving Home.
  useEffect(() => {
    if (!isOpen) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, onClose]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * DRAWER_WIDTH }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    // Closed, the drawer stays mounted off-screen: it must not take touches
    // or be read by screen readers.
    <View
      accessibilityElementsHidden={!isOpen}
      importantForAccessibility={isOpen ? "auto" : "no-hide-descendants"}
      pointerEvents={isOpen ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
    >
      <Pressable
        accessibilityLabel="Close conversations"
        accessibilityRole="button"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.scrim },
            scrimStyle,
          ]}
        />
      </Pressable>

      <Animated.View
        style={[styles.panel, { backgroundColor: colors.card }, panelStyle]}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.brand }]}>
            <ChefHatIcon color={colors.brandForeground} size={22} />
          </View>
          <View style={styles.brandText}>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              RestoAI
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              AI dining assistant
            </Text>
          </View>
        </View>

        <GradientButton onPress={onNewChat} title="New chat" />

        <Text style={[styles.sectionLabel, { color: colors.subtle }]}>
          Conversations
        </Text>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {error ? (
            <Text style={[styles.message, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          {!error && conversations.length === 0 ? (
            <Text style={[styles.message, { color: colors.mutedForeground }]}>
              No conversations yet
            </Text>
          ) : null}

          {error
            ? null
            : conversations.map((conversation) => {
                const isActive = conversation.id === activeThreadId;
                const title =
                  conversation.title?.trim() || UNTITLED_CONVERSATION;

                return (
                  <View key={conversation.id} style={styles.row}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => onSelect(conversation.id)}
                      style={({ pressed }) => [
                        styles.rowMain,
                        {
                          backgroundColor: isActive
                            ? colors.brandMuted
                            : "transparent",
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <MessageIcon
                        color={isActive ? colors.brand : colors.mutedForeground}
                        size={18}
                      />
                      <Text
                        numberOfLines={1}
                        style={[styles.rowTitle, { color: colors.foreground }]}
                      >
                        {title}
                      </Text>
                    </Pressable>

                    <IconButton
                      label={`Delete ${title}`}
                      onPress={() => onDelete(conversation.id)}
                      style={[
                        styles.deleteButton,
                        { backgroundColor: colors.dangerMuted },
                      ]}
                    >
                      <Trash2Icon color={colors.destructive} size={18} />
                    </IconButton>
                  </View>
                );
              })}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.secondary }]}>
          <Text
            numberOfLines={1}
            style={[styles.footerLabel, { color: colors.foreground }]}
          >
            Your account
          </Text>
          <IconButton label="Switch theme" onPress={onToggleTheme}>
            {isDark ? (
              <SunIcon color={colors.foreground} size={18} />
            ) : (
              <MoonIcon color={colors.foreground} size={18} />
            )}
          </IconButton>
          <IconButton label="Sign out" onPress={onSignOut}>
            <LogOutIcon color={colors.mutedForeground} size={18} />
          </IconButton>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 20,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    flexShrink: 1,
  },
  brandName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.sm + 2,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    paddingHorizontal: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 2,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  rowTitle: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  deleteButton: {
    borderRadius: 22,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 18,
  },
  footerLabel: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
