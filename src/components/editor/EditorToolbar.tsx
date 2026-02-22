"use client";

import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth/AuthButton";
import { UsageIndicator } from "./UsageIndicator";

// ---------------------------------------------------------------------------
// Icon helpers (inline SVG — no external icon lib dependency yet)
// ---------------------------------------------------------------------------

function Icon({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary";
  className?: string;
}

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled = false,
  variant = "default",
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
        "transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary"
          ? "text-[var(--color-neutral-0)]"
          : "text-[var(--color-text-secondary)]",
        className
      )}
      style={
        variant === "primary"
          ? { background: "var(--color-brand-primary)" }
          : { background: "transparent" }
      }
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLButtonElement;
        if (variant === "primary") {
          el.style.background = "var(--color-brand-primary-hover)";
        } else {
          el.style.background = "var(--color-bg-tertiary)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        if (variant === "primary") {
          el.style.background = "var(--color-brand-primary)";
        } else {
          el.style.background = "transparent";
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

function ToolbarDivider() {
  return (
    <div
      className="mx-1 h-5 w-px"
      style={{ background: "var(--color-border-default)" }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// EditorToolbar props
// ---------------------------------------------------------------------------

export interface EditorToolbarProps {
  onRegenerate?: () => void;
  onExport?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Slot for viewport toggle — injected by ZEST-026 */
  viewportToggle?: React.ReactNode;
  /** Whether there is a result to export/save */
  hasResult?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorToolbar({
  onRegenerate,
  onExport,
  onSave,
  onUndo,
  onRedo,
  viewportToggle,
  hasResult = false,
  className,
}: EditorToolbarProps) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-1 border-b px-3",
        className
      )}
      style={{
        background: "var(--color-bg-primary)",
        borderColor: "var(--color-border-default)",
      }}
      role="toolbar"
      aria-label="Editor toolbar"
    >
      {/* ── Left group ── */}
      <ToolbarButton
        label="Regenerate"
        onClick={onRegenerate}
        disabled={!hasResult}
        icon={
          <Icon label="Regenerate">
            <path
              d="M2 8a6 6 0 1 1 1.5 4M2 12V8h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        }
      />

      <ToolbarDivider />

      {/* ── Viewport toggle slot (ZEST-026) ── */}
      {viewportToggle ?? (
        <ToolbarButton
          label="Viewport"
          icon={
            <Icon label="Viewport">
              <rect
                x="1"
                y="3"
                width="14"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </Icon>
          }
        />
      )}

      <ToolbarDivider />

      {/* ── Undo / Redo ── */}
      <ToolbarButton
        label="Undo"
        disabled
        onClick={onUndo}
        icon={
          <Icon label="Undo">
            <path
              d="M3 7H9a4 4 0 0 1 0 8H5M3 7l3-3M3 7l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        }
      />
      <ToolbarButton
        label="Redo"
        disabled
        onClick={onRedo}
        icon={
          <Icon label="Redo">
            <path
              d="M13 7H7a4 4 0 0 0 0 8h4M13 7l-3-3M13 7l-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        }
      />

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right group ── */}
      {/* Usage indicator */}
      <UsageIndicator />

      {/* Auth button */}
      <AuthButton />

      <ToolbarDivider />

      <ToolbarButton
        label="Export"
        disabled={!hasResult}
        onClick={onExport}
        icon={
          <Icon label="Export">
            <path
              d="M8 2v8M5 7l3 3 3-3M3 11v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
        }
      />
      <ToolbarButton
        label="Save"
        variant="primary"
        disabled={!hasResult}
        onClick={onSave}
        icon={
          <Icon label="Save">
            <path
              d="M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 2v4H5V2M5 9h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Icon>
        }
      />
    </div>
  );
}
