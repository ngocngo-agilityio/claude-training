import { render } from "@testing-library/react-native";
import {
  AlertCircleIcon,
  ChefHatIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessageIcon,
  MicIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  Trash2Icon,
} from "./Icons";

const icons = {
  ChefHatIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  MicIcon,
  MessageIcon,
  PlusIcon,
  MenuIcon,
  Trash2Icon,
  MoonIcon,
  SunIcon,
  LogOutIcon,
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
