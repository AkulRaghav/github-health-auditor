import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public leaderboard — shows recently audited repos ranked by score.
 */
export async function GET() {
  try {
    // Get the latest audit per repo (deduplicated)
    const audits = await prisma.audit.findMany({
      orderBy: { overallScore: "desc" },
      take: 50,
      select: {
        owner: true,
        repo: true,
        overallScore: true,
        grade: true,
        timestamp: true,
        shareId: true,
      },
    });

    // Deduplicate — keep highest score per repo
    const seen = new Set<string>();
    const unique = audits.filter((a) => {
      const key = `${a.owner}/${a.repo}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ repos: unique });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
