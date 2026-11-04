import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MicIcon, SendIcon } from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize } from "@/theme/typography";

type HomeComposerProps = {
  disabled?: boolean;
  /** Receives the trimmed text when the user sends it. */
  onSend: (text: string) => void;
};

/** Rounded input bar of the home screen with a voice button and a send button. */
export const HomeComposer = ({
  disabled = false,
  onSend,
}: HomeComposerProps) => {
  const [text, setText] = useState("");
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;
  const canSend = !disabled && text.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View
      style={[
        styles.composer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          boxShadow: colors.shadow,
        },
      ]}
    >
      <TextInput
        accessibilityLabel="Message"
        editable={!disabled}
        onChangeText={setText}
        onSubmitEditing={submit}
        placeholder="Ask anything about restaurants…"
        placeholderTextColor={colors.subtle}
        returnKeyType="send"
        style={[styles.input, { color: colors.foreground }]}
        value={text}
      />

      {/* Voice input is not built yet, so the button stays inactive. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Talk to RestoAI"
        accessibilityState={{ disabled: true }}
        disabled
        style={[styles.voice, { backgroundColor: colors.brandMuted }]}
      >
        <MicIcon color={colors.brand} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={submit}
        style={[
          styles.send,
          {
            experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          },
          canSend ? null : styles.sendDisabled,
        ]}
      >
        <SendIcon color="#ffffff" size={20} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 28,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  voice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
