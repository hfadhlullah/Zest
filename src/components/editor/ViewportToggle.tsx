"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const PRESETS = [
  { label: "Mobile", width: 375 },
  { label: "Tablet", width: 768 },
  { label: "Desktop", width: null },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ViewportToggle() {
  const { viewportWidth, setViewportWidth } = useEditorStore();
  const [customInput, setCustomInput] = useState<string>(
    viewportWidth ? String(viewportWidth) : ""
  );

  // Determine active preset
  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.width === viewportWidth)?.label ?? null;
  }, [viewportWidth]);

  // Handle preset button click
  const handlePresetClick = useCallback(
    (width: number | null) => {
      setViewportWidth(width);
      setCustomInput(width ? String(width) : "");
      // TODO: track analytics.track('viewport_changed', { viewport: label, width_px: width })
    },
    [setViewportWidth]
  );

  // Handle custom input change
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(e.currentTarget.value);
  };

  // Handle custom input blur or Enter
  const handleCustomConfirm = useCallback(() => {
    const val = customInput.trim();
    if (!val) {
      setViewportWidth(null);
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setCustomInput(viewportWidth ? String(viewportWidth) : "");
      return;
    }

    // Clamp to 320–1920
    const clamped = Math.max(320, Math.min(1920, num));
    setViewportWidth(clamped);
    setCustomInput(String(clamped));
  }, [customInput, setViewportWidth, viewportWidth]);

  return (
    <div className="flex items-center gap-2">
      {/* Preset buttons */}
      {PRESETS.map(({ label, width }) => (
        <button
          key={label}
          type="button"
          onClick={() => handlePresetClick(width)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
            activePreset === label
              ? "text-[var(--color-neutral-0)]"
              : "text-[var(--color-text-secondary)]",
            "hover:bg-[var(--color-bg-tertiary)]"
          )}
          style={
            activePreset === label
              ? { background: "var(--color-brand-primary)" }
              : { background: "transparent" }
          }
          title={
            width ? `${width}px` : "Desktop (full width)"
          }
        >
          {label}
        </button>
      ))}

      {/* Custom width input */}
      <input
        type="number"
        min={320}
        max={1920}
        value={customInput}
        onChange={handleCustomChange}
        onBlur={handleCustomConfirm}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCustomConfirm();
          }
        }}
        placeholder="Custom px"
        className={cn(
          "w-24 rounded-lg border px-3 py-1.5 text-xs",
          "transition-all duration-150",
          "focus:outline-none"
        )}
        style={{
          borderColor: "var(--color-border-default)",
          background: "var(--color-bg-tertiary)",
          color: "var(--color-text-primary)",
        }}
      />
    </div>
  );
}
