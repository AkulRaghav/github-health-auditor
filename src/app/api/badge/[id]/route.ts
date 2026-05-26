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
      return new NextResponse(generateBadge("health", "not found", "#999"), {
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" },
      });
    }

    const color = audit.overallScore >= 80 ? "#4c1" :
                  audit.overallScore >= 60 ? "#dfb317" :
                  audit.overallScore >= 40 ? "#fe7d37" : "#e05d44";

    const label = "health";
    const value = `${audit.overallScore}% ${audit.grade}`;

    return new NextResponse(generateBadge(label, value, color), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(generateBadge("health", "error", "#999"), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}

function generateBadge(label: string, value: string, color: string): string {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}
