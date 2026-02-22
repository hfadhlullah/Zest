"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = "Type a refinement...",
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter submits (unless Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        setValue("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    setValue(newValue);

    // Auto-resize textarea
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`;
  };

  return (
    <div className={cn("flex gap-2 px-4 py-3", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={1000}
        className={cn(
          "flex-1 resize-none rounded-lg border px-3 py-2 text-xs",
          "transition-all duration-150",
          "focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        style={{
          borderColor: "var(--color-border-default)",
          background: "var(--color-bg-tertiary)",
          color: "var(--color-text-primary)",
          minHeight: 36,
          maxHeight: 120,
        }}
      />
      <button
        onClick={() => {
          if (value.trim()) {
            onSubmit(value);
            setValue("");
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
            }
          }
        }}
        disabled={disabled || !value.trim()}
        className={cn(
          "shrink-0 rounded-lg px-3 py-2 text-xs font-medium",
          "transition-all duration-150",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
        style={{
          background: disabled || !value.trim() ? "transparent" : "var(--color-brand-primary)",
          color: disabled || !value.trim() ? "var(--color-text-muted)" : "white",
        }}
        title="Send refinement (Enter or click)"
      >
        Send
      </button>
    </div>
  );
}
