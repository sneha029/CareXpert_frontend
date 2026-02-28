import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-100/60 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300",
        secondary:
          "border-transparent bg-slate-100/60 text-slate-700 dark:bg-zinc-400/20 dark:text-slate-300",
        destructive:
          "border-transparent bg-rose-100/60 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300",
        outline: "text-foreground border-slate-200/60 dark:border-zinc-700/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge }; // badgeVariants is internal, not exported to keep file component-only
