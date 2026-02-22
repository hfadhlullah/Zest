"use client";

import { Section, Row, PropInput } from "./_shared";
import { ColorPicker } from "../controls/ColorPicker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BorderSectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BorderSection({ styles, onChange }: BorderSectionProps) {
  return (
    <Section title="Border">
      <Row label="Radius">
        <PropInput
          value={(styles.borderRadius as string) ?? ""}
          onChange={(v) => onChange("borderRadius", v)}
          placeholder="0px"
        />
      </Row>
      <Row label="Width">
        <PropInput
          value={(styles.borderWidth as string) ?? ""}
          onChange={(v) => onChange("borderWidth", v)}
          placeholder="0px"
        />
      </Row>
      <Row label="Style">
        <select
          value={(styles.borderStyle as string) || "none"}
          onChange={(e) => onChange("borderStyle", e.target.value)}
          className="h-7 w-full rounded-md border px-2 text-xs"
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
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </Row>
      <Row label="Color">
        <ColorPicker
          value={(styles.borderColor as string) || "#000000"}
          onChange={(v) => onChange("borderColor", v)}
        />
      </Row>
    </Section>
  );
}
