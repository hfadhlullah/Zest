"use client";

import Link from "next/link";
import { MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProjectResponse } from "@/schemas/projects.schema";

export interface ProjectCardProps {
  project: ProjectResponse;
  onDelete?: (projectId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetch(`/api/v1/projects/${project.id}`, {
        method: "DELETE",
      });
      onDelete?.(project.id);
    } catch (err) {
      console.error("[ProjectCard] Delete failed:", err);
      alert("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <Link href={`/editor/${project.id}`}>
      <div
        className="group relative flex flex-col gap-3 rounded-2xl border-2 p-4 transition-all hover:shadow-lg hover:border-[var(--color-primary)]/50"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-bg-secondary)",
        }}
      >
        {/* Thumbnail */}
        <div
          className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 flex items-center justify-center"
          style={{
            borderColor: "var(--color-border)",
          }}
        >
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-3xl font-bold text-[var(--color-primary)]/30">
              {project.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-[var(--color-text)] truncate">
            {project.name}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {formatDate(project.updated_at)}
          </p>
        </div>

        {/* More menu */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>

            {showMenu && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg shadow-lg z-10 min-w-max"
                style={{
                  background: "var(--color-bg)",
                  border: "2px solid var(--color-border)",
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
