import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
      where: { userId },
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
