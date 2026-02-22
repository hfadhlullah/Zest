"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useEditorStore } from "@/store/editor.store";
import { useRefinement } from "@/hooks/useRefinement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatPanelProps {
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Chat panel for refinement requests (ZEST-015).
 *
 * Displays message thread and input. Calls useRefinement hook to send
 * prompts to the /api/v1/generate endpoint with refinement context.
 */
export function ChatPanel({ iframeRef, className }: ChatPanelProps) {
  const { chatMessages } = useEditorStore();
  const { refine, isRefining } = useRefinement({ iframeRef });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div
      className={cn("flex h-full flex-col overflow-hidden", className)}
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        {chatMessages.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            <p className="text-xs">
              No chat yet. Send a refinement to get started.
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSubmit={refine} disabled={isRefining} />
    </div>
  );
}
