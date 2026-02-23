"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types (mirror Go ProviderInfo / ModelInfo)
// ---------------------------------------------------------------------------

export interface ModelInfo {
  id: string;
  display_name: string;
  provider: string;
}

export interface ProviderInfo {
  name: string;
  enabled: boolean;
  models: ModelInfo[];
}

export interface SelectedModel {
  provider: string;
  model: string;
  displayName: string;
}

export interface ModelSelectorProps {
  value: SelectedModel | null;
  onChange: (model: SelectedModel | null) => void;
  disabled?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Provider display names & icons
// ---------------------------------------------------------------------------

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Google Gemini",
  glm: "ZhipuAI GLM",
  copilot: "GitHub Copilot",
};

const PROVIDER_COLORS: Record<string, string> = {
  gemini: "#4285F4",
  glm: "#7C3AED",
  copilot: "#24292F",
};

// ---------------------------------------------------------------------------
// Hook — fetches /api/v1/models once and caches in module scope
// ---------------------------------------------------------------------------

let cachedProviders: ProviderInfo[] | null = null;

function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>(
    cachedProviders ?? []
  );
  const [loading, setLoading] = useState(cachedProviders === null);

  useEffect(() => {
    if (cachedProviders !== null) return;
    let cancelled = false;
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data: { providers: ProviderInfo[] }) => {
        if (cancelled) return;
        cachedProviders = data.providers ?? [];
        setProviders(cachedProviders);
      })
      .catch(() => {
        if (cancelled) return;
        cachedProviders = [];
        setProviders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { providers, loading };
}

// ---------------------------------------------------------------------------
// ModelSelector component
// ---------------------------------------------------------------------------

export function ModelSelector({
  value,
  onChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const { providers, loading } = useProviders();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const enabledProviders = providers.filter((p) => p.enabled);

  const handleSelect = useCallback(
    (provider: string, model: ModelInfo) => {
      onChange({ provider, model: model.id, displayName: model.display_name });
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  const providerColor = value
    ? PROVIDER_COLORS[value.provider] ?? "var(--color-brand-primary)"
    : "var(--color-brand-primary)";

  const buttonLabel = loading
    ? "Loading models…"
    : value
    ? value.displayName
    : "Auto";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Model: ${buttonLabel}. Click to change.`}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          (disabled || loading) && "cursor-not-allowed opacity-50"
        )}
        style={{
          borderColor: open
            ? providerColor
            : "var(--color-border-default)",
          color: value ? providerColor : "var(--color-text-secondary)",
          background: "var(--color-bg-secondary)",
        }}
      >
        {/* Color dot — shows provider colour when a model is selected */}
        <span
          className="inline-block size-2 rounded-full transition-colors"
          style={{ background: providerColor }}
        />
        <span className="max-w-[120px] truncate">{buttonLabel}</span>
        {value && (
          <span
            onClick={handleClear}
            role="button"
            aria-label="Clear model selection"
            className="ml-0.5 flex items-center rounded hover:opacity-70"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select a model"
          className="absolute bottom-full left-0 z-50 mb-1.5 min-w-[220px] overflow-hidden rounded-xl border shadow-lg"
          style={{
            background: "var(--color-bg-primary)",
            borderColor: "var(--color-border-default)",
          }}
        >
          {/* Auto option */}
          <div className="border-b px-2 py-1.5" style={{ borderColor: "var(--color-border-default)" }}>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => { onChange(null); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[var(--color-bg-secondary)]"
              style={{ color: "var(--color-text-primary)" }}
            >
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: "var(--color-bg-brand-subtle)", color: "var(--color-brand-primary)" }}
              >
                A
              </span>
              <div>
                <div className="font-medium">Auto</div>
                <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                  Best available provider
                </div>
              </div>
              {value === null && <CheckIcon className="ml-auto" />}
            </button>
          </div>

          {/* Per-provider model groups */}
          {enabledProviders.length === 0 && (
            <p className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              No providers configured.
            </p>
          )}
          {enabledProviders.map((provider) => (
            <div key={provider.name} className="px-2 py-1.5">
              {/* Provider header */}
              <p
                className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)" }}
              >
                {PROVIDER_LABELS[provider.name] ?? provider.name}
              </p>
              {/* Models */}
              {provider.models.map((model) => {
                const isSelected =
                  value?.provider === provider.name && value?.model === model.id;
                const color = PROVIDER_COLORS[provider.name] ?? "var(--color-brand-primary)";
                return (
                  <button
                    key={model.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(provider.name, model)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[var(--color-bg-secondary)]"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <span
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="flex-1">{model.display_name}</span>
                    {isSelected && <CheckIcon />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Micro icon
// ---------------------------------------------------------------------------

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M2 6l3 3 5-5"
        stroke="var(--color-brand-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
