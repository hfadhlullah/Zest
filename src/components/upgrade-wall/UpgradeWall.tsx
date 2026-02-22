"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UpgradeWallProps {
  className?: string;
  message?: string;
  showCounter?: boolean;
  remaining?: number;
  limit?: number;
}

export function UpgradeWall({
  className,
  message = "You've reached your monthly generation limit.",
  showCounter = true,
  remaining = 0,
  limit = 10,
}: UpgradeWallProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 rounded-3xl border-2 p-8 text-center",
        className
      )}
      style={{
        borderColor: "var(--color-primary)",
        background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 50%, rgba(34, 197, 94, 0.05) 100%)`,
      }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20">
        <Zap className="h-7 w-7 text-white" />
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-white">Upgrade Your Plan</h2>

      {/* Message */}
      <p className="text-sm sm:text-base text-white/80 max-w-sm">{message}</p>

      {/* Counter */}
      {showCounter && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
          <span className="text-sm font-semibold text-white">
            {remaining}/{limit} generations remaining this month
          </span>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/pricing"
          className="flex-1 px-4 py-3 rounded-lg bg-white text-[var(--color-primary)] text-sm sm:text-base font-semibold hover:bg-white/90 transition-colors"
        >
          View Pricing
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 px-4 py-3 rounded-lg border-2 border-white/30 text-white text-sm sm:text-base font-semibold hover:border-white/50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/60">
        Upgrade to Pro to get unlimited generations and more features.
      </p>
    </div>
  );
}
