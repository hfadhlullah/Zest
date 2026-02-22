import type { ReactNode } from "react";

/**
 * Editor root layout.
 *
 * Provides the full-screen shell frame for all routes under /editor.
 * The page.tsx renders inside the EditorShell's canvas slot via the
 * `children` prop — handled by page.tsx directly mounting EditorShell.
 *
 * This layout intentionally stays minimal (no extra wrappers) so that
 * page.tsx has full control over the three-panel composition.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
