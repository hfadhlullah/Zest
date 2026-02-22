"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { GenerationLoaderProps, LoaderStage } from "./GenerationLoader.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_MESSAGES: Record<LoaderStage, string> = {
  thinking: "Thinking...",
  laying_out: "Laying out...",
  styling: "Styling...",
  finishing: "Adding the final touches...",
};

const CYCLE_ORDER: LoaderStage[] = ["thinking", "laying_out", "styling", "finishing"];

const CYCLE_INTERVAL_MS = 3_000;
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
  // If a stage is explicitly provided, use it; otherwise auto-cycle.
  const [cycleIndex, setCycleIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showCancel, setShowCancel] = useState(showCancelProp ?? false);

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
  const message = STAGE_MESSAGES[activeStage];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl",
        "min-h-[320px] w-full",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* ── Animated gradient mesh background ── */}
      <MeshBackground />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Spinner */}
        <SpinnerRing />

        {/* Status message with fade transition */}
        <p
          className="text-lg font-medium transition-opacity duration-300"
          style={{
            color: "var(--color-neutral-0)",
            opacity: visible ? 1 : 0,
          }}
        >
          {message}
        </p>

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
            Cancel
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
  const ref = useRef<HTMLDivElement>(null);

  // Animate the gradient orbs via CSS keyframes defined inline
  return (
    <div
      ref={ref}
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
