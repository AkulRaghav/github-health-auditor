"use client";

import { useState, useRef, lazy, Suspense, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import AuditForm from "@/components/AuditForm";
import ReportSection from "@/components/ReportSection";
import type { AuditResult } from "@/lib/analyzers";
import type { GeneratedFile } from "@/lib/autofix";
import { Activity, GitPullRequest, Shield, FileText, Package, MessageSquare, Zap } from "lucide-react";
import { ExternalAnimatedLink, HighlightLink } from "@/components/AnimatedLink";
import { ScrollRevealSection } from "@/components/ScrollRevealText";
import FeatureExpand from "@/components/FeatureExpand";

const BackgroundModel = lazy(() => import("@/components/BackgroundModel"));
import { ScanPulseIcon } from "@/components/AnimatedIcons";
import AnimatedStats from "@/components/AnimatedStats";
import MouseGlow from "@/components/MouseGlow";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import ScrollStrokePath from "@/components/ScrollStrokePath";
import TiltCard from "@/components/TiltCard";

// Lazy load heavy 3D components
const ParticleField = lazy(() => import("@/components/ParticleField"));
const ScoreOrb = lazy(() => import("@/components/ScoreOrb"));

// Lazy load heavy components — only render when results exist
const VulnerabilityPanel = lazy(() => import("@/components/VulnerabilityPanel"));
const AutoFixPanel = lazy(() => import("@/components/AutoFixPanel"));
const ShareBadge = lazy(() => import("@/components/ShareBadge"));
const TrendsChart = lazy(() => import("@/components/TrendsChart"));

interface FullAuditResult extends AuditResult {
  vulnerabilities?: {
    total: number;
    categorized: {
      critical: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
      high: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
      medium: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
      low: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
      unknown: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
    };
    items: Array<{ id: string; summary: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"; package: string; fixedVersion?: string; references: string[] }>;
  };
  fixes?: GeneratedFile[];
  shareId?: string;
  summary?: string;
}

export default function Home() {
  const [result, setResult] = useState<FullAuditResult | null>(null);
  const [trends, setTrends] = useState<Array<{ score: number; grade: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const autoAuditDone = useRef(false);

  useGSAP(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current.querySelectorAll(".hero-animate"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, { scope: heroRef });

  const handleAudit = async (repoUrl: string, token?: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTrends([]);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");

      setResult(data);

      // Fetch trends in background (non-blocking)
      fetch(`/api/trends/${encodeURIComponent(data.owner)}/${encodeURIComponent(data.repo)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d?.trends) setTrends(d.trends); })
        .catch(() => {});

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-audit if ?audit= param is present (from My Repos page)
  useEffect(() => {
    if (autoAuditDone.current) return;
    const params = new URLSearchParams(window.location.search);
    const auditUrl = params.get("audit");
    if (auditUrl) {
      autoAuditDone.current = true;
      handleAudit(auditUrl);
    }
  }, []);

  const features = [
    { icon: Activity, title: "Commit Activity", desc: "Frequency, spread, contributors" },
    { icon: GitPullRequest, title: "PR Velocity", desc: "Merge times, stale PRs" },
    { icon: MessageSquare, title: "Issue Response", desc: "First response, close rates" },
    { icon: Package, title: "Dependencies", desc: "Freshness, vulnerabilities" },
    { icon: Zap, title: "CI/CD & Tests", desc: "Pipelines, coverage tools" },
    { icon: FileText, title: "Documentation", desc: "README quality, guides" },
    { icon: Shield, title: "Security", desc: "Secrets, policies, scanning" },
  ];

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollStrokePath />

      {/* Background — use opacity instead of blur for performance */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full dark:bg-cyan-500/[0.08] bg-orange-300/[0.15] blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full dark:bg-blue-600/[0.06] bg-violet-300/[0.12] blur-3xl" />
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <Suspense fallback={null}>
          <ParticleField className="opacity-60" />
        </Suspense>
        <FloatingCodeCanvas />
        <MouseGlow />
        <div className="flex max-w-3xl flex-col items-center text-center">
          <div className="hero-animate mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="h-2 w-2 animate-pulse rounded-full dark:bg-cyan-400 bg-orange-500" />
            Open Source Health Scanner
          </div>

          <h1 className="hero-animate mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b dark:from-white dark:to-neutral-400 from-neutral-800 to-neutral-500 bg-clip-text text-transparent">
              Audit Any GitHub
            </span>
            <br />
            <span className="bg-gradient-to-r dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 from-orange-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">
              Repository&apos;s Health
            </span>
          </h1>

          <p className="hero-animate mb-10 max-w-xl text-lg text-neutral-500 dark:text-neutral-400">
            Vulnerability scanning, CI/CD analysis, dependency audits, auto-fix generation,
            and shareable reports. One URL, complete engineering insights.
          </p>

          <div className="hero-animate w-full">
            <AuditForm onSubmit={handleAudit} isLoading={isLoading} />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <ScanPulseIcon isActive={true} className="h-8 w-8" />
              <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] rounded-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
              </div>
              <p className="text-sm text-neutral-500">Scanning 7 dimensions + vulnerability database...</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Complete Health Analysis</h2>
            <p className="text-neutral-500">Seven dimensions + vulnerability scanning + auto-fix generation</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <TiltCard key={i}>
                <div className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-neutral-300 dark:hover:border-white/[0.12] hover:bg-white/60 dark:hover:bg-white/[0.04]">
                  <f.icon className="mb-3 h-6 w-6 dark:text-cyan-400 text-orange-500" />
                  <h3 className="mb-1 font-semibold">{f.title}</h3>
                  <p className="text-sm text-neutral-500">{f.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <AnimatedStats />

      {/* Interactive Feature Showcase */}
      <section className="relative flex flex-col items-center gap-8 px-6 py-24">
        <div className="text-center">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            Nine Dimensions of Analysis
          </h2>
          <p className="text-neutral-400">Hover to explore each capability</p>
        </div>
        <FeatureExpand />
      </section>

      {/* Scroll Reveal Animation */}
      <div className="relative">
        <Suspense fallback={null}>
          <BackgroundModel className="opacity-80" />
        </Suspense>
        <ScrollRevealSection />
      </div>

      {/* Results */}
      {result && (
        <section id="results" className="relative space-y-12 px-6 py-24">
          <div className="mx-auto max-w-6xl space-y-12">
            <ReportSection result={result} />

            <Suspense fallback={null}>
              {trends.length >= 2 && (
                <TrendsChart trends={trends} owner={result.owner} repo={result.repo} />
              )}

              {result.vulnerabilities && (
                <VulnerabilityPanel data={result.vulnerabilities} />
              )}

              {result.fixes && result.fixes.length > 0 && (
                <AutoFixPanel fixes={result.fixes} />
              )}

              {result.shareId && (
                <ShareBadge
                  shareId={result.shareId}
                  owner={result.owner}
                  repo={result.repo}
                  score={result.overallScore}
                  grade={result.grade}
                />
              )}
            </Suspense>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="text-sm text-neutral-500">
            GitHub Repository Health Auditor
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <ExternalAnimatedLink href="https://github.com" className="text-neutral-400">
              GitHub
            </ExternalAnimatedLink>
            <ExternalAnimatedLink href="https://nextjs.org" className="text-neutral-400">
              Next.js
            </ExternalAnimatedLink>
            <ExternalAnimatedLink href="https://gsap.com" className="text-neutral-400">
              GSAP
            </ExternalAnimatedLink>
            <ExternalAnimatedLink href="https://www.prisma.io" className="text-neutral-400">
              Prisma
            </ExternalAnimatedLink>
            <ExternalAnimatedLink href="https://osv.dev" className="text-neutral-400">
              OSV API
            </ExternalAnimatedLink>
          </div>
          <div className="text-lg">
            <HighlightLink href="https://github.com" external className="text-neutral-300">
              Star on GitHub
            </HighlightLink>
          </div>
        </div>
      </footer>
    </main>
  );
}
