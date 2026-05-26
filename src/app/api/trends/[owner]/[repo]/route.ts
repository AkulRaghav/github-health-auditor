import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;

    const audits = await prisma.audit.findMany({
      where: { owner, repo },
      orderBy: { timestamp: "asc" },
      take: 30,
      select: {
        overallScore: true,
        grade: true,
        categories: true,
        timestamp: true,
      },
    });

    const trends = audits.map((audit) => ({
      score: audit.overallScore,
      grade: audit.grade,
      categories: JSON.parse(audit.categories),
      timestamp: audit.timestamp.toISOString(),
    }));

    return NextResponse.json({ owner, repo, trends });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch trends";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
