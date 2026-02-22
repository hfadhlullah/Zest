"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import type { ProjectResponse } from "@/schemas/projects.schema";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch projects
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/v1/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");

        const json = await res.json();
        setProjects(json.data.projects);
      } catch (err) {
        console.error("[Dashboard] Fetch projects failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isSignedIn]);

  const handleCreateProject = async (name: string) => {
    const res = await fetch("/api/v1/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create project");
    }

    const json = await res.json();
    setProjects([json.data, ...projects]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                Your Projects
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {isLoading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p style={{ color: "var(--color-text-secondary)" }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                No projects yet
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Create your first project to get started
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
