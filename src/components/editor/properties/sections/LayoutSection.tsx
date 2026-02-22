"use client";

import { Section, Row, PropInput, PropSelect } from "./_shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LayoutSectionProps {
  styles: Partial<CSSStyleDeclaration>;
  onChange: (prop: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const FLEX_DIRECTION_OPTIONS = [
  { value: "row", label: "Row" },
  { value: "row-reverse", label: "Row Reverse" },
  { value: "column", label: "Column" },
  { value: "column-reverse", label: "Col Reverse" },
];

const ALIGN_ITEMS_OPTIONS = [
  { value: "stretch", label: "Stretch" },
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "baseline", label: "Baseline" },
];

const JUSTIFY_CONTENT_OPTIONS = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Space Between" },
  { value: "space-around", label: "Space Around" },
  { value: "space-evenly", label: "Space Evenly" },
];

const FLEX_WRAP_OPTIONS = [
  { value: "nowrap", label: "No Wrap" },
  { value: "wrap", label: "Wrap" },
  { value: "wrap-reverse", label: "Wrap Reverse" },
];

const GRID_AUTO_FLOW_OPTIONS = [
  { value: "row", label: "Row" },
  { value: "column", label: "Column" },
  { value: "dense", label: "Dense" },
  { value: "row dense", label: "Row Dense" },
  { value: "column dense", label: "Col Dense" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Visible only when the selected element has display: flex or display: grid.
 * The parent (PropertiesPanel) is responsible for conditional rendering.
 */
export function LayoutSection({ styles, onChange }: LayoutSectionProps) {
  const display = (styles.display as string) ?? "";
  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid" || display === "inline-grid";

  if (!isFlex && !isGrid) return null;

  return (
    <Section title="Layout">
      {/* display */}
      <Row label="Display">
        <PropSelect
          value={display}
          onChange={(v) => onChange("display", v)}
          options={[
            { value: "flex", label: "Flex" },
            { value: "inline-flex", label: "Inline Flex" },
            { value: "grid", label: "Grid" },
            { value: "inline-grid", label: "Inline Grid" },
            { value: "block", label: "Block" },
            { value: "inline-block", label: "Inline Block" },
            { value: "inline", label: "Inline" },
          ]}
        />
      </Row>

      {/* Gap — shared between flex & grid */}
      <Row label="Gap">
        <PropInput
          value={(styles.gap as string) ?? ""}
          onChange={(v) => onChange("gap", v)}
          placeholder="0px"
        />
      </Row>

      {/* ── Flex-specific ── */}
      {isFlex && (
        <>
          <Row label="Direction">
            <PropSelect
              value={(styles.flexDirection as string) || "row"}
              onChange={(v) => onChange("flexDirection", v)}
              options={FLEX_DIRECTION_OPTIONS}
            />
          </Row>
          <Row label="Align">
            <PropSelect
              value={(styles.alignItems as string) || "stretch"}
              onChange={(v) => onChange("alignItems", v)}
              options={ALIGN_ITEMS_OPTIONS}
            />
          </Row>
          <Row label="Justify">
            <PropSelect
              value={(styles.justifyContent as string) || "flex-start"}
              onChange={(v) => onChange("justifyContent", v)}
              options={JUSTIFY_CONTENT_OPTIONS}
            />
          </Row>
          <Row label="Wrap">
            <PropSelect
              value={(styles.flexWrap as string) || "nowrap"}
              onChange={(v) => onChange("flexWrap", v)}
              options={FLEX_WRAP_OPTIONS}
            />
          </Row>
        </>
      )}

      {/* ── Grid-specific ── */}
      {isGrid && (
        <>
          <Row label="Columns">
            <PropInput
              value={(styles.gridTemplateColumns as string) ?? ""}
              onChange={(v) => onChange("gridTemplateColumns", v)}
              placeholder="auto"
            />
          </Row>
          <Row label="Rows">
            <PropInput
              value={(styles.gridTemplateRows as string) ?? ""}
              onChange={(v) => onChange("gridTemplateRows", v)}
              placeholder="auto"
            />
          </Row>
          <Row label="Auto Flow">
            <PropSelect
              value={(styles.gridAutoFlow as string) || "row"}
              onChange={(v) => onChange("gridAutoFlow", v)}
              options={GRID_AUTO_FLOW_OPTIONS}
            />
          </Row>
          <Row label="Align">
            <PropSelect
              value={(styles.alignItems as string) || "stretch"}
              onChange={(v) => onChange("alignItems", v)}
              options={ALIGN_ITEMS_OPTIONS}
            />
          </Row>
          <Row label="Justify">
            <PropSelect
              value={(styles.justifyContent as string) || "flex-start"}
              onChange={(v) => onChange("justifyContent", v)}
              options={JUSTIFY_CONTENT_OPTIONS}
            />
          </Row>
        </>
      )}
    </Section>
  );
}
