"use client";

import { useState } from "react";
import { Wrench, Copy, Check, FileCode, Shield, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedFile } from "@/lib/autofix";

interface AutoFixPanelProps {
  fixes: GeneratedFile[];
}

const categoryIcons: Record<string, typeof FileCode> = {
  ci: FileCode,
  security: Shield,
  docs: BookOpen,
  config: Settings,
};

const categoryLabels: Record<string, string> = {
  ci: "CI/CD",
  security: "Security",
  docs: "Documentation",
  config: "Configuration",
};

export default function AutoFixPanel({ fixes }: AutoFixPanelProps) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = async (file: GeneratedFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(file.filename);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  const grouped = fixes.reduce((acc, fix) => {
    if (!acc[fix.category]) acc[fix.category] = [];
    acc[fix.category].push(fix);
    return acc;
  }, {} as Record<string, GeneratedFile[]>);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8">
      <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
        <Wrench className="h-6 w-6 text-cyan-400" />
        Auto-Fix Suggestions
      </h3>
      <p className="mb-6 text-sm text-neutral-400">
        Generated configuration files tailored to your project. Click to preview, copy to add to your repo.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File list */}
        <div className="space-y-2">
          {Object.entries(grouped).map(([category, files]) => {
            const Icon = categoryIcons[category] || FileCode;
            return (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <Icon className="h-3.5 w-3.5" />
                  {categoryLabels[category] || category}
                </div>
                {files.map((file) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFile(file)}
                    className={cn(
                      "mb-1 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      selectedFile?.filename === file.filename
                        ? "border-cyan-500/30 bg-cyan-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{file.filename}</p>
                      <p className="text-xs text-neutral-500">{file.description}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleCopy(file); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleCopy(file); } }}
                      className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                      title="Copy to clipboard"
                    >
                      {copiedFile === file.filename ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-white/[0.06] bg-black/30">
          {selectedFile ? (
            <div className="h-full">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-sm font-medium text-neutral-300">{selectedFile.filename}</span>
                <button
                  onClick={() => handleCopy(selectedFile)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/10"
                >
                  {copiedFile === selectedFile.filename ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedFile === selectedFile.filename ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-h-96 overflow-auto p-4 text-xs leading-relaxed text-neutral-300">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-neutral-600">
              Select a file to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
