"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Section wrapper shared across all property sections
// ---------------------------------------------------------------------------

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <div className={cn("flex flex-col gap-3 px-4 py-3", className)}>
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row: label + control side-by-side
// ---------------------------------------------------------------------------

export interface RowProps {
  label: string;
  children: React.ReactNode;
}

export function Row({ label, children }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="shrink-0 text-xs"
        style={{ color: "var(--color-text-secondary)", minWidth: 72 }}
      >
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared text input
// ---------------------------------------------------------------------------

export interface PropInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function PropInput({ value, onChange, placeholder, className }: PropInputProps) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-7 w-full rounded-md border px-2 text-xs", className)}
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
    />
  );
}

// ---------------------------------------------------------------------------
// Shared select
// ---------------------------------------------------------------------------

export interface PropSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function PropSelect({ value, onChange, options, className }: PropSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-7 w-full rounded-md border px-2 text-xs", className)}
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
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
