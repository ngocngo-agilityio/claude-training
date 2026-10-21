/** Metro resolves an imported image to an asset that `<Image>` can load. */
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native";

  const source: ImageSourcePropType;
  export default source;
}
