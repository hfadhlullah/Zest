"use client";

import { useState } from "react";
import { Section } from "./_shared";
import { SpacingInput } from "../controls/SpacingInput";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpacingSectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse shorthand "X Y Z W" or single-value into [top, right, bottom, left] */
function parseShorthand(val: string | undefined): [string, string, string, string] {
  if (!val || val === "") return ["0px", "0px", "0px", "0px"];
  const parts = val.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

/** Get a side value: check longhand first, then fall back to shorthand */
function getSide(
  styles: Partial<CSSStyleDeclaration>,
  longhand: keyof CSSStyleDeclaration,
  shorthand: keyof CSSStyleDeclaration,
  index: 0 | 1 | 2 | 3
): string {
  const long = styles[longhand] as string | undefined;
  if (long && long !== "") return long;
  return parseShorthand(styles[shorthand] as string | undefined)[index];
}

// ---------------------------------------------------------------------------
// Lock icon
// ---------------------------------------------------------------------------

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ color: locked ? "var(--color-brand-primary)" : "var(--color-text-muted)" }}
    >
      <rect
        x="2.5"
        y="5.5"
        width="7"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {locked ? (
        <path
          d="M4 5.5V4a2 2 0 014 0v1.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 5.5V4a2 2 0 014 0"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BoxModel: 4-side grid (T / R / B / L) with optional linked mode
// ---------------------------------------------------------------------------

interface BoxModelProps {
  top: string;
  right: string;
  bottom: string;
  left: string;
  linked: boolean;
  onLinkedToggle: () => void;
  onChange: (side: "top" | "right" | "bottom" | "left", val: string) => void;
}

function BoxModel({
  top,
  right,
  bottom,
  left,
  linked,
  onLinkedToggle,
  onChange,
}: BoxModelProps) {
  function handleChange(side: "top" | "right" | "bottom" | "left", val: string) {
    if (linked) {
      onChange("top", val);
      onChange("right", val);
      onChange("bottom", val);
      onChange("left", val);
    } else {
      onChange(side, val);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Top */}
      <SpacingInput
        value={top}
        onChange={(v) => handleChange("top", v)}
        label="T"
        className="w-14"
      />
      {/* Middle row: L | lock | R */}
      <div className="flex items-center gap-1">
        <SpacingInput
          value={left}
          onChange={(v) => handleChange("left", v)}
          label="L"
          className="w-14"
        />
        <button
          type="button"
          onClick={onLinkedToggle}
          title={linked ? "Unlink sides" : "Link all sides"}
          className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: linked ? "var(--color-brand-primary)" : "var(--color-border-default)",
            background: linked ? "var(--color-brand-primary-light)" : "var(--color-bg-primary)",
          }}
          aria-pressed={linked}
          aria-label={linked ? "Unlink spacing sides" : "Link spacing sides"}
        >
          <LockIcon locked={linked} />
        </button>
        <SpacingInput
          value={right}
          onChange={(v) => handleChange("right", v)}
          label="R"
          className="w-14"
        />
      </div>
      {/* Bottom */}
      <SpacingInput
        value={bottom}
        onChange={(v) => handleChange("bottom", v)}
        label="B"
        className="w-14"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SpacingSection({ styles, onChange }: SpacingSectionProps) {
  const [paddingLinked, setPaddingLinked] = useState(false);
  const [marginLinked, setMarginLinked] = useState(false);

  // Padding
  const pTop = getSide(styles, "paddingTop", "padding", 0);
  const pRight = getSide(styles, "paddingRight", "padding", 1);
  const pBottom = getSide(styles, "paddingBottom", "padding", 2);
  const pLeft = getSide(styles, "paddingLeft", "padding", 3);

  // Margin
  const mTop = getSide(styles, "marginTop", "margin", 0);
  const mRight = getSide(styles, "marginRight", "margin", 1);
  const mBottom = getSide(styles, "marginBottom", "margin", 2);
  const mLeft = getSide(styles, "marginLeft", "margin", 3);

  function handlePaddingChange(side: "top" | "right" | "bottom" | "left", val: string) {
    const map: Record<string, string> = {
      top: "paddingTop",
      right: "paddingRight",
      bottom: "paddingBottom",
      left: "paddingLeft",
    };
    onChange(map[side], val);
  }

  function handleMarginChange(side: "top" | "right" | "bottom" | "left", val: string) {
    const map: Record<string, string> = {
      top: "marginTop",
      right: "marginRight",
      bottom: "marginBottom",
      left: "marginLeft",
    };
    onChange(map[side], val);
  }

  return (
    <Section title="Spacing">
      {/* Padding */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Padding
        </span>
        <BoxModel
          top={pTop}
          right={pRight}
          bottom={pBottom}
          left={pLeft}
          linked={paddingLinked}
          onLinkedToggle={() => setPaddingLinked((v) => !v)}
          onChange={handlePaddingChange}
        />
      </div>

      {/* Divider */}
      <div
        className="h-px"
        style={{ background: "var(--color-border-default)" }}
        aria-hidden="true"
      />

      {/* Margin */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Margin
        </span>
        <BoxModel
          top={mTop}
          right={mRight}
          bottom={mBottom}
          left={mLeft}
          linked={marginLinked}
          onLinkedToggle={() => setMarginLinked((v) => !v)}
          onChange={handleMarginChange}
        />
      </div>
    </Section>
  );
}
