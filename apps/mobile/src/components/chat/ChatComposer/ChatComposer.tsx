import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MicIcon, SendIcon } from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize } from "@/theme/typography";

type ChatComposerProps = {
  /** While the agent is answering, the send button becomes a stop button. */
  isGenerating?: boolean;
  onSend?: (text: string) => void;
  onStop?: () => void;
};

/** Input pill at the bottom of the chat, with voice (inactive), send and stop. */
export const ChatComposer = ({
  isGenerating = false,
  onSend,
  onStop,
}: ChatComposerProps) => {
  const [text, setText] = useState("");
  const { colors } = useTheme();
  const [gradientStart, gradientEnd] = colors.brandGradient;
  const canSend = text.trim().length > 0;

  // Takes the text from the event: a fast return can run before the state
  // holds the last typed characters.
  const submit = (value: string = text) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
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
        onChangeText={setText}
        onSubmitEditing={(event) => submit(event.nativeEvent.text)}
        placeholder="Ask a follow-up…"
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
        style={[styles.round, { backgroundColor: colors.brandMuted }]}
      >
        <MicIcon color={colors.brand} size={22} />
      </Pressable>

      {isGenerating ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop generating"
          onPress={onStop}
          style={[styles.round, { backgroundColor: colors.foreground }]}
        >
          <View
            style={[styles.stopSquare, { backgroundColor: colors.background }]}
          />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={() => submit()}
          style={[
            styles.round,
            {
              experimental_backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            },
            canSend ? null : styles.disabled,
          ]}
        >
          <SendIcon color="#ffffff" size={20} />
        </Pressable>
      )}
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
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stopSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  disabled: {
    opacity: 0.4,
  },
});
