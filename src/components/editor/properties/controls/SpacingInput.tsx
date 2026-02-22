"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpacingInputProps {
  /** CSS value string e.g. "16px", "1rem", "0" */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A compact single-axis spacing input. Used for individual top/right/bottom/left
 * values inside SpacingSection.
 */
export function SpacingInput({
  value,
  onChange,
  label,
  placeholder = "0px",
  className,
}: SpacingInputProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label && (
        <span
          className="text-center text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border px-1.5 text-center text-xs"
        style={{
          background: "var(--color-bg-primary)",
          borderColor: "var(--color-border-default)",
          color: "var(--color-text-primary)",
          outline: "none",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border-focus)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border-default)")
        }
        aria-label={label}
      />
    </div>
  );
}
