"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Cycles through an array of suggestion strings at a given interval.
 * Returns the current suggestion string and whether it is in the "visible"
 * phase of the cross-fade (used to apply the opacity CSS transition).
 *
 * @param suggestions  Array of strings to cycle through
 * @param intervalMs   How long each suggestion is shown (default 3000ms)
 * @param paused       When true the cycle stops (e.g. input is focused)
 */
export function useSuggestionCycle(
  suggestions: string[],
  intervalMs = 3000,
  paused = false
): { currentSuggestion: string; visible: boolean } {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (suggestions.length <= 1 || paused) return;

    intervalRef.current = setInterval(() => {
      // Fade out (400ms transition handled by CSS)
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
        setVisible(true);
      }, 400); // matches design-system `--duration-theatrical` cross-fade
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [suggestions, intervalMs, paused]);

  const currentSuggestion = suggestions[index] ?? "";
  return { currentSuggestion, visible };
}
