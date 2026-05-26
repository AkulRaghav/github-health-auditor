import { NextRequest } from "next/server";
import { parseRepoUrl, getFileContent, getRepo } from "@/lib/github";
import {
  analyzeCommits,
  analyzePRs,
  analyzeIssues,
  analyzeDeps,
  analyzeTests,
  analyzeDocs,
  analyzeSecurity,
  type CategoryResult,
} from "@/lib/analyzers-individual";
import { scanVulnerabilities, categorizeSeverity } from "@/lib/vulnerability";
import { generateFixes, detectStack } from "@/lib/autofix";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateSummary } from "@/lib/ai-summary";
import crypto from "crypto";

/**
 * Streaming audit endpoint using Server-Sent Events (SSE).
 * Sends each analyzer result as it completes for real-time UI updates.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { repoUrl, token } = body;

  if (!repoUrl || typeof repoUrl !== "string") {
    return new Response(JSON.stringify({ error: "Repository URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let owner: string, repo: string;
  try {
    ({ owner, repo } = parseRepoUrl(repoUrl));
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validToken = token && typeof token === "string" && token.length < 200 ? token : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("start", { owner, repo, timestamp: new Date().toISOString() });

      // Run analyzers sequentially so we can stream each result
      const analyzers: Array<{ key: string; name: string; fn: () => Promise<CategoryResult> }> = [
        { key: "commitFrequency", name: "Commit Frequency", fn: () => analyzeCommits(owner, repo, validToken) },
        { key: "prMergeTime", name: "PR Merge Time", fn: () => analyzePRs(owner, repo, validToken) },
        { key: "issueResponseTime", name: "Issue Response", fn: () => analyzeIssues(owner, repo, validToken) },
        { key: "dependencyFreshness", name: "Dependencies", fn: () => analyzeDeps(owner, repo, validToken) },
        { key: "testCoverage", name: "Test & CI/CD", fn: () => analyzeTests(owner, repo, validToken) },
        { key: "documentation", name: "Documentation", fn: () => analyzeDocs(owner, repo, validToken) },
        { key: "security", name: "Security", fn: () => analyzeSecurity(owner, repo, validToken) },
      ];

      const categories: Record<string, CategoryResult> = {};

      for (const analyzer of analyzers) {
        try {
          const result = await analyzer.fn();
          categories[analyzer.key] = result;
          send("analyzer", { key: analyzer.key, name: analyzer.name, result });
        } catch (e) {
          const errorResult: CategoryResult = {
            score: 0,
            details: `Error: ${(e as Error).message}`,
            findings: [{ type: "error", message: (e as Error).message }],
            metrics: {},
          };
          categories[analyzer.key] = errorResult;
          send("analyzer", { key: analyzer.key, name: analyzer.name, result: errorResult });
        }
      }

      // Calculate overall score
      const weights: Record<string, number> = {
        commitFrequency: 0.15, prMergeTime: 0.15, issueResponseTime: 0.10,
        dependencyFreshness: 0.15, testCoverage: 0.20, documentation: 0.15, security: 0.10,
      };
      let weightedSum = 0, totalWeight = 0;
      for (const [key, weight] of Object.entries(weights)) {
        if (categories[key]) { weightedSum += categories[key].score * weight; totalWeight += weight; }
      }
      const overallScore = Math.round(weightedSum / totalWeight);
      const grade = overallScore >= 90 ? "A+" : overallScore >= 80 ? "A" : overallScore >= 70 ? "B" : overallScore >= 60 ? "C" : overallScore >= 50 ? "D" : "F";

      send("score", { overallScore, grade });

      // Vulnerability scan
      send("phase", { name: "Scanning vulnerabilities..." });
      let vulnerabilities = null;
      let packageJsonContent: string | null = null;
      try {
        packageJsonContent = await getFileContent(owner, repo, "package.json", validToken);
        if (packageJsonContent) {
          const pkg = JSON.parse(packageJsonContent);
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          if (Object.keys(deps).length > 0) {
            const vulns = await scanVulnerabilities(deps);
            vulnerabilities = { total: vulns.length, categorized: categorizeSeverity(vulns), items: vulns.slice(0, 20) };
          }
        }
      } catch { /* optional */ }
      send("vulnerabilities", vulnerabilities);

      // Auto-fix generation
      send("phase", { name: "Generating fixes..." });
      let languages: string[] = [];
      try { const info = await getRepo(owner, repo, validToken); if (info.language) languages.push(info.language); } catch {}
      const stackInfo = detectStack(packageJsonContent, languages);
      const fixes = generateFixes(stackInfo, repo);
      send("fixes", { fixes, stackInfo });

      // Save to DB
      const shareId = crypto.randomBytes(4).toString("hex");
      try {
        const session = await auth();
        const userId = (session?.user as { id?: string })?.id || null;
        await prisma.audit.create({
          data: { owner, repo, repoUrl: `https://github.com/${owner}/${repo}`, overallScore, grade, categories: JSON.stringify(categories), shareId, userId },
        });
      } catch {}

      // AI Summary
      const auditResultForSummary = { owner, repo, repoUrl: `https://github.com/${owner}/${repo}`, timestamp: new Date().toISOString(), overallScore, grade, categories: categories as any };
      const summary = generateSummary(auditResultForSummary);
      send("summary", { summary });

      // Final complete event
      send("complete", {
        owner, repo, repoUrl: `https://github.com/${owner}/${repo}`,
        timestamp: new Date().toISOString(), overallScore, grade,
        categories, vulnerabilities, fixes, shareId, stackInfo, summary,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
