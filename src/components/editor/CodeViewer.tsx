"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeViewerProps {
    html: string;
    css?: string;
    className?: string;
}

export function CodeViewer({ html, css, className }: CodeViewerProps) {
    const [activeFile, setActiveFile] = useState<"html" | "css">("html");

    return (
        <div className={cn("flex h-full w-full overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm", className)}>
            {/* ── File Explorer Sidebar ── */}
            <div className="w-48 shrink-0 border-r border-border/50 bg-muted/20 flex flex-col">
                <div className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    Files
                </div>
                <div className="p-2 flex flex-col gap-1">
                    <button
                        onClick={() => setActiveFile("html")}
                        className={cn(
                            "text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                            activeFile === "html" ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span className="mr-2 opacity-50">#</span> index.html
                    </button>
                    {css && (
                        <button
                            onClick={() => setActiveFile("css")}
                            className={cn(
                                "text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                                activeFile === "css" ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span className="mr-2 opacity-50">*</span> styles.css
                        </button>
                    )}
                </div>
            </div>

            {/* ── Code Editor Area ── */}
            <div className="flex-1 flex flex-col bg-[#0d1117] text-[#c9d1d9] overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b border-white/5 bg-[#161b22] text-xs font-mono text-white/50">
                    {activeFile === "html" ? "index.html" : "styles.css"}
                </div>
                <ScrollArea className="flex-1">
                    <pre className="p-4 text-sm font-mono leading-relaxed">
                        <code>{activeFile === "html" ? html : css}</code>
                    </pre>
                </ScrollArea>
            </div>
        </div>
    );
}
