"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an rgb()/rgba() computed color string to a hex string.
 * Falls back to the raw value if conversion fails.
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb.startsWith("#") ? rgb : "#000000";
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function isValidHex(val: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(val);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorPickerProps {
  /** Current color value (any CSS color — will be normalised to hex) */
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const hex = isValidHex(value) ? value : rgbToHex(value);

  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(hex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep input in sync when value changes externally
  useEffect(() => {
    setInputVal(isValidHex(value) ? value : rgbToHex(value));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setInputVal(v);
    if (isValidHex(v)) onChange(v);
  }

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
      )}

      {/* Swatch + hex input row */}
      <div className="flex items-center gap-2">
        {/* Swatch button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-7 w-7 shrink-0 rounded-md border-2 transition-shadow duration-150"
          style={{
            background: isValidHex(inputVal) ? inputVal : "#000000",
            borderColor: "var(--color-border-default)",
          }}
          aria-label={`Open color picker — current color ${inputVal}`}
        />

        {/* Hex text input */}
        <input
          type="text"
          value={inputVal}
          onChange={handleHexInput}
          maxLength={7}
          spellCheck={false}
          className="h-7 w-full rounded-md border px-2 text-xs font-mono"
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
          aria-label="Hex color value"
        />
      </div>

      {/* Picker popover */}
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-lg"
          style={{
            background: "var(--color-bg-primary)",
            borderColor: "var(--color-border-default)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <HexColorPicker
            color={isValidHex(hex) ? hex : "#000000"}
            onChange={(c) => {
              setInputVal(c);
              onChange(c);
            }}
          />
        </div>
      )}
    </div>
  );
}
