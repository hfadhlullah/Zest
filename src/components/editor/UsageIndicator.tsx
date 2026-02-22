"use client";

import { useUserStore } from "@/store/user.store";
import { cn } from "@/lib/utils";

export interface UsageIndicatorProps {
  className?: string;
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const { generationCount, generationLimit } = useUserStore();

  // Calculate usage percentage
  const percentage = (generationCount / generationLimit) * 100;

  // Determine color based on usage
  const isNearLimit = percentage >= 80;
  const isAtLimit = generationCount >= generationLimit;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium",
        className
      )}
      style={{
        background: isAtLimit
          ? "rgba(239, 68, 68, 0.1)"
          : isNearLimit
            ? "rgba(251, 146, 60, 0.1)"
            : "transparent",
      }}
    >
      {/* Visual indicator dot */}
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: isAtLimit
            ? "var(--color-error, #ef4444)"
            : isNearLimit
              ? "var(--color-warning, #fb923c)"
              : "var(--color-brand-primary, #22c55e)",
        }}
      />

      {/* Text */}
      <span
        style={{
          color: isAtLimit
            ? "var(--color-error, #ef4444)"
            : isNearLimit
              ? "var(--color-warning, #fb923c)"
              : "var(--color-text-secondary, #6b7280)",
        }}
      >
        {generationCount} / {generationLimit}
      </span>
    </div>
  );
}
