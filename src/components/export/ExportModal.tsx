"use client";

import { useState } from "react";
import { X, AlertCircle, Download } from "lucide-react";
import { useGenerationStore } from "@/store/generation.store";
import { useExportStore } from "@/store/export.store";
import { useExport } from "@/hooks/useExport";
import { FormatCard } from "./FormatCard";
import { CodePreviewPanel } from "./CodePreviewPanel";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

export function ExportModal() {
  const { result: generation } = useGenerationStore();
  const {
    isOpen,
    selectedFormat,
    selectedFiles,
    isExporting,
    error,
    closeExportModal,
    setSelectedFormat,
    toggleFileSelection,
  } = useExportStore();

  const { downloadExport } = useExport();

  if (!isOpen || !generation) {
    return null;
  }

  const handleFormatChange = (format: OutputFormat) => {
    setSelectedFormat(format);
  };

  const handleExport = async () => {
    await downloadExport();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-4xl max-h-[90vh] flex-col gap-6 rounded-3xl bg-[var(--color-bg)] p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Export Project
          </h2>
          <button
            onClick={closeExportModal}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left: Format & File selection */}
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
            {/* Format selection */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                Export Format
              </h3>
              <div className="grid gap-3">
                <FormatCard
                  format="html_css"
                  isSelected={selectedFormat === "html_css"}
                  onSelect={handleFormatChange}
                  features={[
                    "Separate HTML and CSS files",
                    "Compatible with any editor",
                    "Lightweight output",
                  ]}
                />
                <FormatCard
                  format="tailwind"
                  isSelected={selectedFormat === "tailwind"}
                  onSelect={handleFormatChange}
                  features={[
                    "Single HTML file with Tailwind classes",
                    "Full design system integration",
                    "Easy customization",
                  ]}
                  planRequired="pro"
                />
              </div>
            </div>

            {/* File selection */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                Files to Export
              </h3>
              <div className="space-y-2">
                {selectedFormat === "html_css" ? (
                  <>
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has("html")}
                        onChange={() => toggleFileSelection("html")}
                        className="h-4 w-4 rounded cursor-pointer accent-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        index.html
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has("css")}
                        onChange={() => toggleFileSelection("css")}
                        className="h-4 w-4 rounded cursor-pointer accent-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        styles.css
                      </span>
                    </label>
                  </>
                ) : (
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has("html")}
                      onChange={() => toggleFileSelection("html")}
                      className="h-4 w-4 rounded cursor-pointer accent-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text)]">
                      index.html
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right: Code preview */}
          <div className="w-96 flex flex-col gap-3 border-l border-[var(--color-border)] pl-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Preview
            </h3>
            <CodePreviewPanel
              generation={generation}
              format={selectedFormat}
              selectedFiles={selectedFiles}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={closeExportModal}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFiles.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
