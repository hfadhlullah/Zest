"use client";

import { Section, Row, PropInput } from "./_shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DimensionsSectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DimensionsSection({ styles, onChange }: DimensionsSectionProps) {
  return (
    <Section title="Dimensions">
      <Row label="Width">
        <PropInput
          value={(styles.width as string) ?? ""}
          onChange={(v) => onChange("width", v)}
          placeholder="auto"
        />
      </Row>
      <Row label="Height">
        <PropInput
          value={(styles.height as string) ?? ""}
          onChange={(v) => onChange("height", v)}
          placeholder="auto"
        />
      </Row>
      <Row label="Min W">
        <PropInput
          value={(styles.minWidth as string) ?? ""}
          onChange={(v) => onChange("minWidth", v)}
          placeholder="none"
        />
      </Row>
      <Row label="Max W">
        <PropInput
          value={(styles.maxWidth as string) ?? ""}
          onChange={(v) => onChange("maxWidth", v)}
          placeholder="none"
        />
      </Row>
    </Section>
  );
}
