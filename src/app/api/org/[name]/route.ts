import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/analyzers";

interface OrgRepo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  score: number;
  grade: string;
  error?: string;
}

/**
 * Org-wide audit — fetches all public repos for an org and audits them.
 * Returns a summary with scores for each repo.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const token = request.nextUrl.searchParams.get("token") || undefined;

    // Validate org name
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
      return NextResponse.json({ error: "Invalid organization name" }, { status: 400 });
    }

    // Fetch org repos
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "github-health-auditor/1.0",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `https://api.github.com/orgs/${name}/repos?sort=updated&per_page=10&type=public`,
      { headers }
    );

    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      return NextResponse.json({ error: `GitHub API error: ${res.status}` }, { status: res.status });
    }

    const repos = await res.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json({ error: "No public repos found for this organization" }, { status: 404 });
    }

    // Audit top 10 repos (limited to avoid rate limits)
    const results = await Promise.allSettled(
      repos.slice(0, 10).map(async (repo: { name: string; full_name: string; description: string; language: string; stargazers_count: number }) => {
        try {
          const audit = await runAudit(name, repo.name, token);
          return {
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            score: audit.overallScore,
            grade: audit.grade,
            categories: audit.categories,
          };
        } catch (e) {
          return {
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            score: 0,
            grade: "?",
            error: (e as Error).message,
          };
        }
      })
    );

    const auditedRepos = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<OrgRepo>).value);

    const avgScore = auditedRepos.length > 0
      ? Math.round(auditedRepos.reduce((sum, r: any) => sum + (r.score || 0), 0) / auditedRepos.length)
      : 0;

    return NextResponse.json({
      org: name,
      totalRepos: repos.length,
      auditedCount: auditedRepos.length,
      averageScore: avgScore,
      repos: auditedRepos,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
