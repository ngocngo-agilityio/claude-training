import type { ReactNode } from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
};

type IconBaseProps = IconProps & {
  children: ReactNode;
};

/** Stroke icon frame shared by the Lucide icons below. */
const IconBase = ({
  children,
  color = "#000000",
  size = 20,
}: IconBaseProps) => (
  <Svg
    accessible={false}
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </Svg>
);

export const ChefHatIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
    <Path d="M6 17h12" />
  </IconBase>
);

export const MailIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Rect height={16} rx={2} width={20} x={2} y={4} />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </IconBase>
);

export const LockIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Rect height={11} rx={2} width={18} x={3} y={11} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconBase>
);

export const EyeIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <Circle cx={12} cy={12} r={3} />
  </IconBase>
);

export const EyeOffIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <Path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <Path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <Path d="m2 2 20 20" />
  </IconBase>
);

export const AlertCircleIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Circle cx={12} cy={12} r={10} />
    <Line x1={12} x2={12} y1={8} y2={12} />
    <Line x1={12} x2={12.01} y1={16} y2={16} />
  </IconBase>
);

export const MicIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1={12} x2={12} y1={19} y2={22} />
  </IconBase>
);

export const MessageIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconBase>
);

export const MenuIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Line x1={4} x2={20} y1={7} y2={7} />
    <Line x1={4} x2={14} y1={12} y2={12} />
    <Line x1={4} x2={20} y1={17} y2={17} />
  </IconBase>
);

export const Trash2Icon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M3 6h18" />
    <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </IconBase>
);

export const MoonIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </IconBase>
);

export const SunIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Circle cx={12} cy={12} r={4} />
    <Line x1={12} x2={12} y1={2} y2={4} />
    <Line x1={12} x2={12} y1={20} y2={22} />
    <Line x1={4.93} x2={6.34} y1={4.93} y2={6.34} />
    <Line x1={17.66} x2={19.07} y1={17.66} y2={19.07} />
    <Line x1={2} x2={4} y1={12} y2={12} />
    <Line x1={20} x2={22} y1={12} y2={12} />
    <Line x1={4.93} x2={6.34} y1={19.07} y2={17.66} />
    <Line x1={17.66} x2={19.07} y1={6.34} y2={4.93} />
  </IconBase>
);

export const LogOutIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Path d="m16 17 5-5-5-5" />
    <Line x1={21} x2={9} y1={12} y2={12} />
  </IconBase>
);

export const NewChatIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
  </IconBase>
);

export const SendIcon = (props: IconProps) => (
  <IconBase {...props}>
    <Path d="m5 12 7-7 7 7" />
    <Path d="M12 19V5" />
  </IconBase>
);
