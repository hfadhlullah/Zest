"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/store/editor.store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isError = !!message.error;

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white",
          isUser
            ? "bg-[var(--color-brand-primary)]"
            : isError
              ? "bg-red-500"
              : "bg-[var(--color-text-muted)]"
        )}
      >
        {isUser ? "U" : "A"}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-xs flex-1 rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-[var(--color-brand-primary)] text-white"
            : isError
              ? "bg-red-100 text-red-900"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
