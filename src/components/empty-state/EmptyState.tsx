"use client";

import { cn } from "@/lib/utils";
import { PromptBar } from "@/components/prompt-bar/PromptBar";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";

// ---------------------------------------------------------------------------
// Template suggestions
// ---------------------------------------------------------------------------

const TEMPLATE_SUGGESTIONS = [
  "A landing page for a SaaS product with a hero section and pricing cards",
  "A dashboard with a sidebar, stats cards, and a data table",
  "A login form with email/password fields and a social sign-in option",
  "A blog post page with a featured image, author info, and related articles",
  "A mobile-first e-commerce product page with an image gallery",
  "A settings page with tabs for profile, notifications, and billing",
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (value: string) => void;
  loading?: boolean;
  format?: OutputFormat;
  onFormatChange?: (format: OutputFormat) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmptyState({
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  format,
  onFormatChange,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center px-4 py-16",
        className
      )}
    >
      {/* Logo mark */}
      <LogoMark />

      {/* Headline */}
      <h1
        className="mb-8 mt-6 text-center text-4xl font-bold tracking-tight md:text-5xl"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-text-primary)",
        }}
      >
        What will you build today?
      </h1>

      {/* PromptBar */}
      <div className="w-full max-w-2xl">
        <PromptBar
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          loading={loading}
          format={format}
          onFormatChange={onFormatChange}
          suggestions={TEMPLATE_SUGGESTIONS}
        />
      </div>

      {/* Divider */}
      <div className="mt-10 flex items-center gap-3">
        <div
          className="h-px w-16"
          style={{ background: "var(--color-border-default)" }}
        />
        <span
          className="text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          or start from a template
        </span>
        <div
          className="h-px w-16"
          style={{ background: "var(--color-border-default)" }}
        />
      </div>

      {/* Template cards */}
      <div className="mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_SUGGESTIONS.slice(0, 6).map((suggestion) => (
          <TemplateCard
            key={suggestion}
            text={suggestion}
            onClick={() => {
              onPromptChange(suggestion);
              onSubmit(suggestion);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogoMark() {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{
        background: "var(--color-brand-primary)",
        boxShadow: "var(--shadow-brand-lg)",
        animation: "logoPulse 3s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes logoPulse {
          0%, 100% { box-shadow: var(--shadow-brand-lg); }
          50% { box-shadow: 0 8px 32px rgba(34,197,94,0.55); }
        }
      `}</style>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 24 L16 8 L24 24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 19 H21"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface TemplateCardProps {
  text: string;
  onClick: () => void;
}

function TemplateCard({ text, onClick }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200"
      style={{
        background: "var(--color-bg-primary)",
        borderColor: "var(--color-border-default)",
        color: "var(--color-text-secondary)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--color-border-brand)";
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--color-bg-brand-subtle)";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--color-brand-secondary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--color-border-default)";
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--color-bg-primary)";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--color-text-secondary)";
      }}
    >
      {text}
    </button>
  );
}
