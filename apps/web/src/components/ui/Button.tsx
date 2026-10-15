import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/class-name";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-sm hover:brightness-105 active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-orange-500/30",
        outline:
          "border border-orange-500 bg-transparent text-orange-500 hover:bg-orange-500/10 active:bg-orange-500/15 focus-visible:ring-3 focus-visible:ring-orange-500/20",
        ghost:
          "bg-transparent text-foreground hover:bg-muted active:bg-muted/80 focus-visible:ring-3 focus-visible:ring-ring/30",
      },
      size: {
        default: "h-11 rounded-xl px-5 text-sm",
        sm: "h-9 rounded-lg px-3 text-xs",
        icon: "size-9 rounded-lg",
        "icon-xl": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      type={asChild ? undefined : type}
      {...props}
    />
  );
};
