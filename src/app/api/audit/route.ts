import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, getFileContent, getRepo } from "@/lib/github";
import { runAudit } from "@/lib/analyzers";
import { scanVulnerabilities, categorizeSeverity } from "@/lib/vulnerability";
import { generateFixes, detectStack } from "@/lib/autofix";
import { generateSummary } from "@/lib/ai-summary";
import { analyzeCommitQuality } from "@/lib/commit-quality";
import { checkLicenses } from "@/lib/license-checker";
import { generateHealthCheckAction } from "@/lib/github-action-generator";
import { auditCache } from "@/lib/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import crypto from "crypto";

// Simple in-memory rate limiter (per IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { repoUrl, token } = body;

    // Input validation
    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    if (repoUrl.length > 500) {
      return NextResponse.json({ error: "URL too long" }, { status: 400 });
    }

    // Validate token format if provided (GitHub tokens start with ghp_, gho_, etc.)
    if (token && typeof token === "string" && token.length > 0) {
      if (token.length > 200 || !/^(ghp_|gho_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]+$/.test(token)) {
        return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
      }
    }

    const { owner, repo } = parseRepoUrl(repoUrl);

    // Check cache first
    const cacheKey = `${owner}/${repo}`;
    const cached = auditCache.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true, cacheAge: auditCache.getAge(cacheKey) });
    }

    // Run the core audit
    const auditResult = await runAudit(owner, repo, token || undefined);

    // Run vulnerability scan if package.json exists
    let vulnerabilities = null;
    let packageJsonContent: string | null = null;
    try {
      packageJsonContent = await getFileContent(owner, repo, "package.json", token);
      if (packageJsonContent) {
        const pkg = JSON.parse(packageJsonContent);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (Object.keys(deps).length > 0) {
          const vulns = await scanVulnerabilities(deps);
          vulnerabilities = {
            total: vulns.length,
            categorized: categorizeSeverity(vulns),
            items: vulns.slice(0, 20),
          };
        }
      }
    } catch {
      // Vulnerability scan is optional
    }

    // Detect stack and generate auto-fix suggestions
    let languages: string[] = [];
    try {
      const repoInfo = await getRepo(owner, repo, token);
      if (repoInfo.language) languages.push(repoInfo.language);
    } catch { /* */ }

    const stackInfo = detectStack(packageJsonContent, languages);
    const fixes = generateFixes(stackInfo, repo);

    // Commit quality analysis
    let commitQuality = null;
    try { commitQuality = await analyzeCommitQuality(owner, repo, token || undefined); } catch {}

    // License compatibility check
    let licenseCheck = null;
    try { licenseCheck = await checkLicenses(owner, repo, token || undefined); } catch {}

    // GitHub Action workflow
    const githubAction = generateHealthCheckAction(owner, repo);

    // Generate share ID (cryptographically random)
    const shareId = crypto.randomBytes(4).toString("hex");

    // Save to database
    let savedAuditId: string | null = null;
    try {
      const session = await auth();
      const userId = (session?.user as { id?: string })?.id || null;
      const saved = await prisma.audit.create({
        data: {
          owner,
          repo,
          repoUrl: auditResult.repoUrl,
          overallScore: auditResult.overallScore,
          grade: auditResult.grade,
          categories: JSON.stringify(auditResult.categories),
          shareId,
          userId,
        },
      });
      savedAuditId = saved.id;
    } catch {
      // DB save is optional — app works without it
    }

    const responseData = {
      ...auditResult,
      vulnerabilities,
      fixes,
      shareId,
      savedAuditId,
      stackInfo,
      summary: generateSummary(auditResult),
      commitQuality,
      licenseCheck,
      githubAction,
      cached: false,
    };

    // Store in cache
    auditCache.set(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
