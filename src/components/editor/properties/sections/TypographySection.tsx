"use client";

import { Section, Row, PropInput, PropSelect } from "./_shared";

// ---------------------------------------------------------------------------
// Fonts available in the design system (AC: font-family dropdown)
// ---------------------------------------------------------------------------

const FONT_OPTIONS = [
  { value: "'Cabinet Grotesk', sans-serif", label: "Cabinet Grotesk" },
  { value: "'Clash Display', sans-serif", label: "Clash Display" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "Georgia, serif", label: "Georgia" },
];

const FONT_WEIGHT_OPTIONS = [
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
];

const TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypographySectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TypographySection({ styles, onChange }: TypographySectionProps) {
  return (
    <Section title="Typography">
      <Row label="Font">
        <PropSelect
          value={styles.fontFamily ?? ""}
          onChange={(v) => onChange("fontFamily", v)}
          options={FONT_OPTIONS}
        />
      </Row>
      <Row label="Size">
        <PropInput
          value={styles.fontSize ?? ""}
          onChange={(v) => onChange("fontSize", v)}
          placeholder="16px"
        />
      </Row>
      <Row label="Weight">
        <PropSelect
          value={styles.fontWeight ?? ""}
          onChange={(v) => onChange("fontWeight", v)}
          options={FONT_WEIGHT_OPTIONS}
        />
      </Row>
      <Row label="Line height">
        <PropInput
          value={styles.lineHeight ?? ""}
          onChange={(v) => onChange("lineHeight", v)}
          placeholder="1.5"
        />
      </Row>
      <Row label="Tracking">
        <PropInput
          value={styles.letterSpacing ?? ""}
          onChange={(v) => onChange("letterSpacing", v)}
          placeholder="0px"
        />
      </Row>
      <Row label="Align">
        <PropSelect
          value={styles.textAlign ?? "left"}
          onChange={(v) => onChange("textAlign", v)}
          options={TEXT_ALIGN_OPTIONS}
        />
      </Row>
    </Section>
  );
}
