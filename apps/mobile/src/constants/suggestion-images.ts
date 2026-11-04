import type { ImageSourcePropType } from "react-native";
import type { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import familyDistrict1 from "../../assets/suggestions/family-district-1.jpg";
import japaneseRiver from "../../assets/suggestions/japanese-river.jpg";
import romanticDowntown from "../../assets/suggestions/romantic-downtown.jpg";
import vegetarianDistrict3 from "../../assets/suggestions/vegetarian-district-3.jpg";

type SuggestionId = (typeof RESTAURANT_CHAT_SUGGESTIONS)[number]["id"];

/** Tile photos of the home suggestions, keyed by the shared suggestion id. */
export const SUGGESTION_IMAGES: Record<SuggestionId, ImageSourcePropType> = {
  "romantic-downtown": romanticDowntown,
  "japanese-river": japaneseRiver,
  "family-district-1": familyDistrict1,
  "vegetarian-district-3": vegetarianDistrict3,
};
