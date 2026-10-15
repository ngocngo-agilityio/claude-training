import { z } from "zod";

export const changeThemeInputSchema = z.object({
  theme: z
    .enum(["light", "dark"])
    .describe("The color theme to apply to the application"),
});
