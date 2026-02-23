import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /**
   * The main title of the empty state
   */
  title: string;
  
  /**
   * The description text providing context
   */
  description: string;
  
  /**
   * Optional CTA button label
   */
  ctaLabel?: string;
  
  /**
   * Optional callback when CTA is clicked
   */
  onCtaClick?: () => void;
  
  /**
   * Optional icon to display at the top
   */
  icon?: ReactNode;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
  
  /**
   * Size variant for different contexts
   */
  variant?: "default" | "compact";
}

/**
 * EmptyState - A reusable component for displaying empty list states
 * 
 * @example
 * <EmptyState
 *   title="No Doctors Available"
 *   description="Start by adding your first doctor to manage consultations."
 *   ctaLabel="Add Doctor"
 *   onCtaClick={() => navigate('/doctors/new')}
 *   icon={<StethoscopeIcon />}
 * />
 */
export default function EmptyState({
  title,
  description,
  ctaLabel,
  onCtaClick,
  icon,
  className,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";
  
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "p-8" : "p-12 md:p-16",
        "border-dashed border-2",
        "bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-zinc-900/50 dark:to-blue-950/20",
        "border-slate-200 dark:border-zinc-800",
        className
      )}
    >
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        {icon && (
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center",
                "text-blue-600 dark:text-blue-400",
                isCompact ? "w-12 h-12" : "w-16 h-16"
              )}
            >
              {icon}
            </div>
          </div>
        )}

        {/* Title */}
        <h3
          className={cn(
            "font-semibold text-gray-900 dark:text-white",
            isCompact ? "text-lg" : "text-xl md:text-2xl"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-gray-600 dark:text-gray-400",
            isCompact ? "text-sm" : "text-base"
          )}
        >
          {description}
        </p>

        {/* CTA Button */}
        {ctaLabel && onCtaClick && (
          <div className="pt-2">
            <Button
              onClick={onCtaClick}
              size={isCompact ? "sm" : "default"}
              className="shadow-sm"
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
