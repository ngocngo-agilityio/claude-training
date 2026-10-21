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
