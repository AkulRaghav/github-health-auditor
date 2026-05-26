import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "desc" },
      take: 50,
      select: {
        id: true,
        owner: true,
        repo: true,
        repoUrl: true,
        overallScore: true,
        grade: true,
        timestamp: true,
        shareId: true,
      },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
