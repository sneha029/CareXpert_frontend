import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50 shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-600/90 hover:to-violet-600/90",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-600/90",
        outline:
          "border border-slate-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-zinc-900/60",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/60",
        ghost: "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button }; // buttonVariants is internal helper
