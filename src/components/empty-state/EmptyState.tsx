"use client";

import { cn } from "@/lib/utils";
import { PromptBar } from "@/components/prompt-bar/PromptBar";
import type { OutputFormat } from "@/components/prompt-bar/PromptBar.types";
import type { SelectedModel } from "@/components/model-selector/ModelSelector";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

// ---------------------------------------------------------------------------
// Template suggestions
// ---------------------------------------------------------------------------

const TEMPLATE_SUGGESTIONS = [
  "A high-converting SaaS landing page with animated gradients",
  "An analytics dashboard with a sidebar and glassmorphism cards",
  "A modern e-commerce product page with a dark mode toggle",
  "A personal portfolio with a masonry gallery layout",
  "A setting page matching Lovable's clean aesthetic",
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
  selectedModel?: SelectedModel | null;
  onModelChange?: (model: SelectedModel | null) => void;
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
  selectedModel,
  onModelChange,
  className,
}: EmptyStateProps) {
  const { isSignedIn, isLoaded, user } = useUser();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background text-foreground",
        className
      )}
      style={{
        background: "radial-gradient(circle at top, rgba(120, 119, 198, 0.04) 0%, transparent 60%), radial-gradient(circle at bottom, rgba(120, 119, 198, 0.04) 0%, transparent 60%)"
      }}
    >
      {/* ── Top Navigation ──────────────────────────────────────────────── */}
      <header className="flex h-16 w-full items-center justify-between px-6 lg:px-10 z-10">
        <div className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <LogoMark small />
          <span>Zest</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Community</a>
          <a href="#" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Templates</a>
          <a href="#" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <div className="flex items-center gap-3">
            {isLoaded ? (
              isSignedIn ? (
                <>
                  <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">Log in</button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/onboarding" fallbackRedirectUrl="/onboarding">
                    <button className="rounded-full bg-foreground text-background px-4 py-1.5 hover:bg-foreground/90 transition-colors">Sign up</button>
                  </SignUpButton>
                </>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 w-full max-w-4xl mx-auto z-10">

        <h1
          className="mb-8 text-center text-4xl font-black tracking-tighter md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          What do you want to build?
        </h1>

        {/* PromptBar */}
        <div className="w-full relative shadow-[0_0_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_-15px_rgba(255,255,255,0.05)] rounded-2xl">
          <PromptBar
            value={prompt}
            onChange={onPromptChange}
            onSubmit={onSubmit}
            loading={loading}
            format={format}
            onFormatChange={onFormatChange}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            suggestions={TEMPLATE_SUGGESTIONS}
            className="border-border/50 bg-background/80 backdrop-blur-xl"
          />
        </div>

        {/* Templates Row */}
        <div className="mt-8 flex flex-col items-center w-full">
          <p className="mb-4 text-sm text-muted-foreground">Or start with a template</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TEMPLATE_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="group rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-xs text-muted-foreground transition-all hover:border-foreground/20 hover:bg-muted/50 hover:text-foreground"
                onClick={() => {
                  onPromptChange(suggestion);
                  onSubmit(suggestion);
                }}
              >
                {suggestion.length > 40 ? suggestion.substring(0, 40) + "..." : suggestion}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogoMark({ small }: { small?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-primary text-primary-foreground",
        small ? "h-6 w-6 rounded-md" : "h-16 w-16 mb-6"
      )}
      style={{
        boxShadow: small ? "none" : "0 4px 14px 0 rgba(0,0,0,0.1)",
      }}
    >
      <svg
        width={small ? "14" : "32"}
        height={small ? "14" : "32"}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 24 L16 8 L24 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 19 H21"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
