import type { Processor } from "@mastra/core/processors";
import { REGEX_PATTERNS } from "@repo/shared/constants/regex";

/**
 * Clean spacing and hidden control characters in one text value.
 * Keep letter case, accents, emoji, and booking values such as dates and times.
 * For example, "  Book   for 4  " becomes "Book for 4".
 */
const normalizeUserText = (text: string): string =>
  text
    // Combine letters with their accents without changing the visible words.
    .normalize("NFC")
    // Convert Windows and older Mac line breaks to the same format.
    .replace(REGEX_PATTERNS.CARRIAGE_RETURN_LINE_BREAKS, "\n")
    // Keep line breaks. Replace other controls with spaces so "4" and "5"
    // separated by a control character do not become "45".
    .replace(REGEX_PATTERNS.CONTROL_CHARACTERS, (character) =>
      character === "\n" ? "\n" : " ",
    )
    // Turn repeated spaces and tabs into one normal space.
    .replace(REGEX_PATTERNS.SPACES_AND_TABS, " ")
    // Remove extra whitespace at the start and end.
    .trim();

export const restaurantInputNormalizer = {
  id: "restaurant-input-normalizer",
  /**
   * Clean user text before the agent calls the model.
   * Messages may include recalled history, so leave other roles unchanged.
   * Return copies of user messages instead of editing the original objects.
   */
  processInput({ messages }) {
    return messages.map((message) => {
      // Skip assistant replies, system instructions, and tool results.
      if (message.role !== "user") return message;

      // Copy the message and its content, keeping IDs and other fields.
      return {
        ...message,
        content: {
          ...message.content,
          // A message can contain text and files. Clean only its text parts.
          parts: message.content.parts?.map((part) =>
            part.type === "text"
              ? { ...part, text: normalizeUserText(part.text) }
              : part,
          ),
          // Older formats store a separate text copy in content.content.
          // Clean it when present so both text copies use the same rules.
          ...(typeof message.content.content === "string"
            ? { content: normalizeUserText(message.content.content) }
            : {}),
        },
      };
    });
  },
} satisfies Processor;
