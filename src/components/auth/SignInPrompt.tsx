"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

export interface SignInPromptProps {
  title?: string;
  description?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function SignInPrompt({
  title = "Save your work",
  description = "Sign in free to save and manage your projects.",
  onDismiss,
  dismissible = true,
}: SignInPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border-2 p-4 sm:p-6"
      style={{
        borderColor: "var(--color-primary)",
        backgroundColor: "var(--color-primary)",
        backgroundImage: `linear-gradient(135deg, var(--color-primary), var(--color-primary) 50%, rgba(34, 197, 94, 0.05))`,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-white/80 mb-4">{description}</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-white text-[var(--color-primary)] px-3 py-2 text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 text-white px-3 py-2 text-xs sm:text-sm font-medium hover:border-white/50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Close button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
