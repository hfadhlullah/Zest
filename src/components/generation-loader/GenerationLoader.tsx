"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GenerationLoaderProps, LoaderStage } from "./GenerationLoader.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_MESSAGES: Record<LoaderStage, { headline: string; sub: string }> = {
  thinking: {
    headline: "The AI is working on it…",
    sub: "Reading your prompt and planning the layout",
  },
  laying_out: {
    headline: "Building the structure…",
    sub: "Arranging elements and components",
  },
  styling: {
    headline: "Applying styles…",
    sub: "Choosing colours, spacing and typography",
  },
  finishing: {
    headline: "Almost there…",
    sub: "Polishing the final details",
  },
};

// Progress checkpoints aligned to each stage (0–100)
const STAGE_PROGRESS: Record<LoaderStage, number> = {
  thinking: 15,
  laying_out: 40,
  styling: 70,
  finishing: 90,
};

const CYCLE_ORDER: LoaderStage[] = ["thinking", "laying_out", "styling", "finishing"];

const CYCLE_INTERVAL_MS = 3_500;
const CANCEL_DELAY_MS = 15_000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GenerationLoader({
  stage,
  onCancel,
  showCancel: showCancelProp,
  className,
}: GenerationLoaderProps) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showCancel, setShowCancel] = useState(showCancelProp ?? false);
  const [progress, setProgress] = useState(5);

  // Auto-cycle through stages when no external stage is provided
  useEffect(() => {
    if (stage !== undefined) return;

    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCycleIndex((i) => (i + 1) % CYCLE_ORDER.length);
        setVisible(true);
      }, 300);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [stage]);

  // Animate progress bar incrementally
  useEffect(() => {
    const activeStage: LoaderStage = stage ?? CYCLE_ORDER[cycleIndex];
    const target = STAGE_PROGRESS[activeStage];
    // Smoothly nudge progress toward target in small steps
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return p;
        return Math.min(p + 1, target);
      });
    }, 80);
    return () => clearInterval(id);
  }, [stage, cycleIndex]);

  // Auto-show cancel after 15 seconds if not controlled externally
  useEffect(() => {
    if (showCancelProp !== undefined) {
      setShowCancel(showCancelProp);
      return;
    }
    const id = setTimeout(() => setShowCancel(true), CANCEL_DELAY_MS);
    return () => clearTimeout(id);
  }, [showCancelProp]);

  const activeStage: LoaderStage = stage ?? CYCLE_ORDER[cycleIndex];
  const { headline, sub } = STAGE_MESSAGES[activeStage];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl",
        "min-h-[420px] w-full",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={headline}
    >
      {/* ── Animated gradient mesh background ── */}
      <MeshBackground />

      {/* ── UI Skeleton Layout ── */}
      <UISkeleton />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center" style={{ maxWidth: 420 }}>
        {/* Spinner */}
        <SpinnerRing />

        {/* Status messages with fade transition */}
        <div
          className="flex flex-col items-center gap-2 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <p
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--color-neutral-0)" }}
          >
            {headline}
          </p>
          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {sub}
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-full overflow-hidden rounded-full"
          style={{
            height: 4,
            background: "rgba(255,255,255,0.15)",
            width: 240,
          }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: "var(--color-brand-primary)",
            }}
          />
        </div>

        {/* Cancel link */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: showCancel ? 1 : 0,
            pointerEvents: showCancel ? "auto" : "none",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="text-sm underline underline-offset-2 transition-opacity duration-150 hover:opacity-70"
            style={{ color: "var(--color-brand-accent)" }}
            tabIndex={showCancel ? 0 : -1}
          >
            Cancel generation
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MeshBackground() {
  // Animate the gradient orbs via CSS keyframes defined inline
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{ background: "var(--color-brand-secondary)" }}
    >
      {/* Orb 1 — large, slow drift */}
      <div
        className="mesh-orb absolute rounded-full"
        style={{
          width: "60%",
          paddingBottom: "60%",
          top: "-20%",
          left: "-10%",
          background:
            "radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)",
          opacity: 0.35,
          animation: "meshDrift1 8s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 2 — medium, offset drift */}
      <div
        className="mesh-orb absolute rounded-full"
        style={{
          width: "45%",
          paddingBottom: "45%",
          bottom: "-15%",
          right: "-5%",
          background:
            "radial-gradient(circle, var(--color-brand-accent) 0%, transparent 70%)",
          opacity: 0.25,
          animation: "meshDrift2 10s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 3 — small, central pulse */}
      <div
        className="mesh-orb absolute rounded-full"
        style={{
          width: "30%",
          paddingBottom: "30%",
          top: "30%",
          left: "35%",
          background:
            "radial-gradient(circle, var(--color-brand-primary-hover) 0%, transparent 70%)",
          opacity: 0.2,
          animation: "meshDrift3 6s ease-in-out infinite alternate",
        }}
      />

      {/* Keyframe definitions — scoped to this element's subtree */}
      <style>{`
        @keyframes meshDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(8%, 10%) scale(1.12); }
        }
        @keyframes meshDrift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-6%, -8%) scale(1.08); }
        }
        @keyframes meshDrift3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(4%, -5%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

function SpinnerRing() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 56, height: 56 }}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-4"
        style={{
          borderColor: "rgba(255,255,255,0.15)",
        }}
      />
      {/* Spinning arc */}
      <div
        className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
        style={{
          borderTopColor: "var(--color-brand-primary)",
          animationDuration: "900ms",
          animationTimingFunction: "linear",
        }}
      />
      {/* Inner dot */}
      <div
        className="h-3 w-3 rounded-full"
        style={{ background: "var(--color-brand-primary)" }}
      />
    </div>
  );
}

function UISkeleton() {
  return (
    <div
      className="absolute inset-0 p-8 flex flex-col gap-6 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full opacity-40">
        <div
          className="h-8 w-32 rounded-md animate-pulse"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
        <div className="flex gap-4">
          <div
            className="h-8 w-8 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "150ms" }}
          />
          <div
            className="h-8 w-8 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "300ms" }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 gap-6 opacity-40 mt-4">
        {/* Sidebar */}
        <div className="w-48 hidden md:flex flex-col gap-4">
          <div
            className="h-4 w-3/4 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "0ms" }}
          />
          <div
            className="h-4 w-1/2 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "100ms" }}
          />
          <div
            className="h-4 w-5/6 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "200ms" }}
          />
          <div
            className="h-4 w-2/3 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "300ms" }}
          />
        </div>

        {/* Grid/Hero area */}
        <div className="flex-1 flex flex-col gap-6">
          <div
            className="h-40 w-full rounded-xl animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)", animationDelay: "400ms" }}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.15)", animationDelay: "500ms" }}
            />
            <div
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.15)", animationDelay: "600ms" }}
            />
            <div
              className="h-32 rounded-xl animate-pulse hidden md:block"
              style={{ background: "rgba(255,255,255,0.15)", animationDelay: "700ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
