"use client";

import { cn } from "@/lib/utils";
import type { ErrorCode } from "@/types/api";

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

interface ErrorVariant {
  icon: React.ReactNode;
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
}

function getVariant(code: ErrorCode | undefined): ErrorVariant {
  switch (code) {
    case "RATE_LIMIT_EXCEEDED":
    case "PLAN_LIMIT_EXCEEDED":
      return {
        icon: <LockIcon />,
        title: "Limit reached",
        message: "You've used all your free generations for now.",
        primaryAction: "Upgrade",
      };
    case "VALIDATION_ERROR":
      return {
        icon: <InfoIcon />,
        title: "Prompt too short",
        message: "Please enter at least 10 characters.",
        primaryAction: "Edit Prompt",
      };
    case "CONTENT_MODERATED":
      return {
        icon: <ShieldIcon />,
        title: "Prompt not allowed",
        message:
          "Your prompt was flagged by our content filter. Please revise and try again.",
        primaryAction: "Edit Prompt",
      };
    case "GENERATION_TIMEOUT":
      return {
        icon: <ClockIcon />,
        title: "Taking longer than expected",
        message: "The AI service is taking too long. Please try again.",
        primaryAction: "Retry",
        secondaryAction: "Cancel",
      };
    default:
      return {
        icon: <WarningIcon />,
        title: "Generation failed",
        message:
          "We couldn't reach the AI service. This is usually temporary.",
        primaryAction: "Try Again",
        secondaryAction: "Report Issue",
      };
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  code?: ErrorCode;
  /** Override the default message for this error code */
  message?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ErrorState({
  code,
  message,
  onPrimaryAction,
  onSecondaryAction,
  className,
}: ErrorStateProps) {
  const variant = getVariant(code);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className
      )}
      role="alert"
    >
      {/* Icon */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--color-warning-light)" }}
      >
        {variant.icon}
      </div>

      {/* Title */}
      <h2
        className="text-xl font-semibold"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-text-primary)",
        }}
      >
        {variant.title}
      </h2>

      {/* Message */}
      <p
        className="max-w-sm text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {message ?? variant.message}
      </p>

      {/* Actions */}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: "var(--color-brand-primary)",
            color: "var(--color-neutral-0)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-brand-primary-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-brand-primary)";
          }}
        >
          {variant.primaryAction}
        </button>

        {variant.secondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              borderColor: "var(--color-border-default)",
              color: "var(--color-text-secondary)",
            }}
          >
            {variant.secondaryAction}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function WarningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="var(--color-warning)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        stroke="var(--color-warning)"
        strokeWidth="2"
      />
      <path
        d="M7 11V7a5 5 0 0110 0v4"
        stroke="var(--color-warning)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--color-info)"
        strokeWidth="2"
      />
      <path
        d="M12 16v-4m0-4h.01"
        stroke="var(--color-info)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="var(--color-warning)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="var(--color-warning)" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        stroke="var(--color-warning)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
