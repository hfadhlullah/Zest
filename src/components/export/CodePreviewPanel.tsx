"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import type { GenerateResponseData } from "@/types/api";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

export interface CodePreviewPanelProps {
  generation: GenerateResponseData;
  format: OutputFormat;
  selectedFiles: Set<string>;
}

export function CodePreviewPanel({
  generation,
  format,
  selectedFiles,
}: CodePreviewPanelProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Determine which files to show based on format and selection
  const files = useMemo(() => {
    const result: Record<string, string> = {};

    if (format === "html_css") {
      if (selectedFiles.has("html")) {
        result["index.html"] = generation.html;
      }
      if (selectedFiles.has("css")) {
        result["styles.css"] = generation.css;
      }
    } else {
      // Tailwind format: single HTML file with inline Tailwind classes
      if (selectedFiles.has("html")) {
        result["index.html"] = generation.html;
      }
    }

    return result;
  }, [generation, format, selectedFiles]);

  const fileList = Object.entries(files);

  if (fileList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">
        Select files to preview
      </div>
    );
  }

  const [activeFile, activeContent] = fileList[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopiedFile(activeFile);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error("[CodePreviewPanel] Copy failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* File tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
        {fileList.map(([name]) => (
          <button
            key={name}
            onClick={() => {}} // Tab switching would be implemented here
            className="px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border-b-2 border-transparent hover:border-[var(--color-primary)]/30 transition-colors"
          >
            {name}
          </button>
        ))}
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-bg-secondary)] rounded-lg">
        {/* Header with copy button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            {activeFile}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            title="Copy code"
          >
            {copiedFile === activeFile ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code content */}
        <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-[var(--color-text)] whitespace-pre-wrap break-words">
          <code>{activeContent}</code>
        </pre>
      </div>
    </div>
  );
}
