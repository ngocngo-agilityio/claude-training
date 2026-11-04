import { render } from "@testing-library/react-native";
import {
  AlertCircleIcon,
  ChefHatIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MicIcon,
  NewChatIcon,
  SendIcon,
} from "./Icons";

const icons = {
  ChefHatIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  MenuIcon,
  MicIcon,
  NewChatIcon,
  SendIcon,
};

describe("Icons", () => {
  it.each(Object.entries(icons))(
    "renders %s without crashing",
    async (_name, Icon) => {
      const { toJSON } = await render(<Icon color="#000000" size={20} />);

      expect(toJSON()).toBeTruthy();
    },
  );
});
