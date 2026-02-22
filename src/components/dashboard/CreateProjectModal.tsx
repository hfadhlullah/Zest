"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(projectName.trim());
      setProjectName("");
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create project";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-md rounded-3xl border-2 p-6"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5" style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="block text-xs font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError(null);
              }}
              placeholder="My awesome UI..."
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
