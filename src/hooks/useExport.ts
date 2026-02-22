"use client";

import { useCallback } from "react";
import { useGenerationStore } from "@/store/generation.store";
import { useExportStore } from "@/store/export.store";

export function useExport() {
  const { result: generation } = useGenerationStore();
  const { selectedFormat, selectedFiles, setExporting, setError } =
    useExportStore();

  const downloadExport = useCallback(async () => {
    if (!generation) {
      setError("No generation to export");
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generation.generation_id,
          output_format: selectedFormat,
          selected_files: Array.from(selectedFiles),
        }),
      });

      if (!response.ok) {
        const apiError = await response.json().catch(() => null);
        const errorMsg =
          apiError?.error?.message ||
          `Export failed (${response.status}: ${response.statusText})`;
        setError(errorMsg);
        return;
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zest-export-${generation.generation_id.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close modal after successful export
      useExportStore.setState({ isOpen: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
    } finally {
      setExporting(false);
    }
  }, [generation, selectedFormat, selectedFiles, setExporting, setError]);

  return { downloadExport };
}
