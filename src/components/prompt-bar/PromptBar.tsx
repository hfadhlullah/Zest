"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuggestionCycle } from "./useSuggestionCycle";
import type { PromptBarProps, OutputFormat } from "./PromptBar.types";

const MAX_CHARS = 2000;
const MIN_CHARS = 10;
/** Show counter at 80% of max */
const COUNTER_THRESHOLD = Math.floor(MAX_CHARS * 0.8);

const FORMAT_LABELS: Record<OutputFormat, string> = {
  html_css: "HTML / CSS",
  tailwind: "Tailwind CSS",
};

export function PromptBar({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  format = "html_css",
  onFormatChange,
  suggestions = [],
  className,
}: PromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const { currentSuggestion, visible } = useSuggestionCycle(
    suggestions,
    3000,
    focused || value.length > 0
  );

  // Auto-grow textarea (1 line min, 6 lines max)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(ta).lineHeight, 10) || 24;
    const maxHeight = lineHeight * 6;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value.slice(0, MAX_CHARS);
      onChange(next);
      if (inlineError) setInlineError(null);
    },
    [onChange, inlineError]
  );

  const handleSubmit = useCallback(() => {
    if (loading || disabled) return;
    if (value.trim().length < MIN_CHARS) {
      setInlineError(
        `Please enter at least ${MIN_CHARS} characters to generate.`
      );
      return;
    }
    setInlineError(null);
    onSubmit(value.trim());
  }, [loading, disabled, value, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const toggleFormat = useCallback(() => {
    const next: OutputFormat =
      format === "html_css" ? "tailwind" : "html_css";
    onFormatChange?.(next);
  }, [format, onFormatChange]);

  const charCount = value.length;
  const showCounter = charCount >= COUNTER_THRESHOLD;
  const isOverLimit = charCount >= MAX_CHARS;

  const isDisabled = disabled || loading;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border bg-white p-3 shadow-sm transition-shadow",
        focused && "shadow-[var(--shadow-brand)]",
        isDisabled && "opacity-60 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: focused
          ? "var(--color-border-focus)"
          : "var(--color-border-default)",
        transition: "box-shadow var(--duration-normal) var(--ease-spring), border-color var(--duration-normal) var(--ease-spring)",
      }}
    >
      {/* ── Textarea + placeholder ─────────────────────────────────────── */}
      <div className="relative">
        {/* Animated placeholder — only shown when value is empty and not focused */}
        {value.length === 0 && suggestions.length > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 px-1 py-1 text-base leading-6 select-none"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
              opacity: visible ? 1 : 0,
              transition: "opacity 400ms var(--ease-theatrical)",
            }}
          >
            {currentSuggestion}
          </span>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isDisabled}
          rows={1}
          placeholder={suggestions.length === 0 ? "Describe the UI you want to build…" : ""}
          aria-label="Prompt"
          aria-describedby={inlineError ? "prompt-error" : undefined}
          aria-invalid={!!inlineError}
          className={cn(
            "relative w-full resize-none bg-transparent px-1 py-1 text-base leading-6 outline-none placeholder:text-muted-foreground",
            isDisabled && "cursor-not-allowed"
          )}
          style={{
            minHeight: "1.5rem",
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      {/* ── Inline validation error ────────────────────────────────────── */}
      {inlineError && (
        <p
          id="prompt-error"
          role="alert"
          aria-live="assertive"
          className="text-sm"
          style={{ color: "var(--color-error)" }}
        >
          {inlineError}
        </p>
      )}

      {/* ── Toolbar row ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Format toggle */}
        <button
          type="button"
          onClick={toggleFormat}
          disabled={isDisabled}
          aria-label={`Output format: ${FORMAT_LABELS[format]}. Click to toggle.`}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            isDisabled && "cursor-not-allowed opacity-50"
          )}
          style={{
            borderColor: "var(--color-border-default)",
            color: "var(--color-text-secondary)",
            background: "var(--color-bg-secondary)",
          }}
        >
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: "var(--color-brand-primary)" }}
          />
          {FORMAT_LABELS[format]}
        </button>

        <div className="flex items-center gap-2">
          {/* Character counter */}
          {showCounter && (
            <span
              aria-live="polite"
              className="text-xs tabular-nums"
              style={{
                color: isOverLimit
                  ? "var(--color-error)"
                  : "var(--color-text-muted)",
              }}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}

          {/* Submit button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isDisabled}
            aria-label={loading ? "Generating…" : "Generate UI"}
            aria-busy={loading}
            onClick={handleSubmit}
            className="gap-1.5 font-semibold"
            style={{
              background: "var(--color-brand-primary)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
            }}
          >
            {loading ? (
              <>
                <Spinner />
                <span className="sr-only">Generating…</span>
              </>
            ) : (
              <>
                Generate
                <kbd
                  aria-hidden="true"
                  className="hidden rounded border px-1 text-xs sm:inline"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  ⌘↵
                </kbd>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spinner sub-component
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}
