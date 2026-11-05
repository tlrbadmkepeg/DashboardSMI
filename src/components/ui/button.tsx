import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-white shadow-sm hover:bg-accent-strong",
        navy: "bg-navy text-white shadow-sm hover:bg-navy-700",
        gold: "bg-gold text-navy-900 font-semibold shadow-sm hover:bg-gold-light",
        glass: "border border-white/25 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:border-white/40",
        outline: "border border-line bg-white text-navy hover:bg-canvas hover:border-navy-300",
        ghost: "text-navy-500 hover:bg-canvas hover:text-navy",
        success: "bg-ok text-white hover:bg-ok/90",
        danger: "bg-white text-bad border border-bad/30 hover:bg-bad-soft",
        link: "text-accent underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
