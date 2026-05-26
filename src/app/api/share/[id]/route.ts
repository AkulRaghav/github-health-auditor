import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audit = await prisma.audit.findUnique({
      where: { shareId: id },
    });

    if (!audit) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      owner: audit.owner,
      repo: audit.repo,
      repoUrl: audit.repoUrl,
      overallScore: audit.overallScore,
      grade: audit.grade,
      categories: JSON.parse(audit.categories),
      timestamp: audit.timestamp.toISOString(),
      shareId: audit.shareId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
