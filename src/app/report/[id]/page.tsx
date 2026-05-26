"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import ReportSection from "@/components/ReportSection";
import type { AuditResult } from "@/lib/analyzers";
import { Loader2 } from "lucide-react";

export default function SharedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/share/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Report not found");
        }
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  return (
      <main className="min-h-screen bg-background pt-24 text-foreground">
        <Navbar />

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="mt-4 text-neutral-500">Loading report...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-12 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result && <ReportSection result={result} />}
        </div>
      </main>
  );
}
