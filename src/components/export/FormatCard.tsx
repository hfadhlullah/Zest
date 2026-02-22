"use client";

import { Check } from "lucide-react";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

export interface FormatCardProps {
  format: OutputFormat;
  isSelected: boolean;
  onSelect: (format: OutputFormat) => void;
  features: string[];
  planRequired?: string; // "free" | "pro" | null
}

export function FormatCard({
  format,
  isSelected,
  onSelect,
  features,
  planRequired,
}: FormatCardProps) {
  const formatLabel = format === "html_css" ? "HTML + CSS" : "Tailwind";
  const isLocked = planRequired === "pro";

  return (
    <button
      onClick={() => !isLocked && onSelect(format)}
      className={`relative flex flex-col gap-4 rounded-2xl border-2 p-4 transition-all ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
      } ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">
            {formatLabel}
          </h3>
          {isLocked && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Pro plan required
            </p>
          )}
        </div>
        {isSelected && !isLocked && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
        {features.map((feature, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="text-[var(--color-primary)]">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
