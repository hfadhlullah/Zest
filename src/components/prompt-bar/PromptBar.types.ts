export type OutputFormat = "html_css" | "tailwind";

export interface PromptBarProps {
  /** Controlled prompt value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Called when user submits a valid prompt */
  onSubmit: (value: string) => void;
  /** Disables input and shows spinner on the submit button */
  loading?: boolean;
  /** Fully disables the component */
  disabled?: boolean;
  /** Selected output format */
  format?: OutputFormat;
  /** Format change handler */
  onFormatChange?: (format: OutputFormat) => void;
  /** Cycling placeholder suggestions (shown when value is empty) */
  suggestions?: string[];
  /** Additional className for the outer container */
  className?: string;
}
