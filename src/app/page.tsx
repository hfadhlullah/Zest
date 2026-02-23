"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { useGenerationStore } from "@/store/generation.store";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");

  const { prompt, format, selectedModel, setPrompt, setFormat, setSelectedModel, setLoading } = useGenerationStore();

  function handleSubmit(value: string) {
    if (isLoaded && !isSignedIn) {
      setPendingPrompt(value);
      setShowAuthModal(true);
      return;
    }

    setPrompt(value);
    setLoading(true);
    startTransition(() => {
      // Navigate to editor; editor will auto-trigger generation from ?prompt=
      router.push(`/editor?prompt=${encodeURIComponent(value)}`);
    });
  }

  return (
    <>
      <EmptyState
        prompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
        loading={isPending}
        format={format}
        onFormatChange={setFormat}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="p-0 border-none bg-transparent w-full max-w-md">
          <SignIn
            routing="hash"
            forceRedirectUrl={`/editor?prompt=${encodeURIComponent(pendingPrompt)}`}
            signUpUrl="/sign-up"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
