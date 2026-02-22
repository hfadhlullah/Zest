"use client";

import { Section, Row } from "./_shared";
import { ColorPicker } from "../controls/ColorPicker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorsSectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ColorsSection({ styles, onChange }: ColorsSectionProps) {
  return (
    <Section title="Colors">
      <Row label="Text">
        <ColorPicker
          value={styles.color ?? "#000000"}
          onChange={(v) => onChange("color", v)}
        />
      </Row>
      <Row label="Background">
        <ColorPicker
          value={styles.backgroundColor ?? "transparent"}
          onChange={(v) => onChange("backgroundColor", v)}
        />
      </Row>
    </Section>
  );
}
