import { StyleSheet, Text, View } from "react-native";
import { AlertCircleIcon, CheckIcon } from "@/components/icons/Icons/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize, lineHeight } from "@/theme/typography";

type ResultsChipProps = {
  label: string;
  variant: "success" | "failed";
};

/** Pill that states the outcome of a search: green when it found results, red when it failed. */
export const ResultsChip = ({ label, variant }: ResultsChipProps) => {
  const { colors } = useTheme();
  const isSuccess = variant === "success";
  const tone = isSuccess ? colors.success : colors.destructive;

  return (
    <View
      accessibilityRole={isSuccess ? "text" : "alert"}
      style={[
        styles.chip,
        {
          backgroundColor: isSuccess ? colors.successMuted : colors.dangerMuted,
          borderColor: isSuccess ? colors.successBorder : colors.dangerBorder,
        },
      ]}
    >
      {isSuccess ? (
        <CheckIcon color={tone} size={15} />
      ) : (
        <AlertCircleIcon color={tone} size={15} />
      )}
      <Text style={[styles.label, { color: tone }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
});
