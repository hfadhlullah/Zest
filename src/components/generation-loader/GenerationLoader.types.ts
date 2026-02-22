export type LoaderStage =
  | "thinking"
  | "laying_out"
  | "styling"
  | "finishing";

export interface GenerationLoaderProps {
  /** Current stage — drives the status message displayed */
  stage?: LoaderStage;
  /** Called when the user clicks the cancel link */
  onCancel?: () => void;
  /** Whether to show the cancel link (shown after 15 seconds) */
  showCancel?: boolean;
  /** Additional className for the outer container */
  className?: string;
}
