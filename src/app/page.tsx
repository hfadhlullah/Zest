"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { useGenerationStore } from "@/store/generation.store";

export default function HomePage() {
  const router = useRouter();
  const { prompt, format, setPrompt, setFormat } = useGenerationStore();

  function handleSubmit(value: string) {
    setPrompt(value);
    // Navigate to editor; editor will auto-trigger generation from ?prompt=
    router.push(`/editor?prompt=${encodeURIComponent(value)}`);
  }

  return (
    <EmptyState
      prompt={prompt}
      onPromptChange={setPrompt}
      onSubmit={handleSubmit}
      format={format}
      onFormatChange={setFormat}
    />
  );
}
