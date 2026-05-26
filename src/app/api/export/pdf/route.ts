import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * PDF Export — generates a beautiful, animated HTML report.
 * Uses CSS animations for print-ready visual appeal.
 */
export async function GET(request: NextRequest) {
  const shareId = request.nextUrl.searchParams.get("id");

  if (!shareId) {
    return NextResponse.json({ error: "Share ID required" }, { status: 400 });
  }

  const audit = await prisma.audit.findUnique({ where: { shareId } });

  if (!audit) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const categories = JSON.parse(audit.categories);
  const html = generatePdfHtml(audit, categories);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="repohealth-${audit.owner}-${audit.repo}.html"`,
    },
  });
}

function generatePdfHtml(
  audit: { owner: string; repo: string; overallScore: number; grade: string; timestamp: Date },
  categories: Record<string, { score: number; details: string; findings: Array<{ type: string; message: string }> }>
) {
  const categoryNames: Record<string, { name: string; icon: string }> = {
    commitFrequency: { name: "Commit Frequency", icon: "📝" },
    prMergeTime: { name: "PR Merge Time", icon: "🔀" },
    issueResponseTime: { name: "Issue Response", icon: "💬" },
    dependencyFreshness: { name: "Dependencies", icon: "📦" },
    testCoverage: { name: "Test & CI/CD", icon: "🧪" },
    documentation: { name: "Documentation", icon: "📚" },
    security: { name: "Security", icon: "🔒" },
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";
  const scoreBg = (s: number) => s >= 80 ? "rgba(34,197,94,0.1)" : s >= 60 ? "rgba(234,179,8,0.1)" : s >= 40 ? "rgba(249,115,22,0.1)" : "rgba(239,68,68,0.1)";

  const categoriesHtml = Object.entries(categoryNames).map(([key, meta], i) => {
    const cat = categories[key];
    if (!cat) return "";
    return `
      <div class="category-card" style="animation-delay: ${0.3 + i * 0.1}s">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon">${meta.icon}</span>
            <strong>${meta.name}</strong>
          </div>
          <span class="card-score" style="color: ${scoreColor(cat.score)}">${cat.score}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="--target-width: ${cat.score}%; background: ${scoreColor(cat.score)}"></div>
        </div>
        <p class="card-details">${cat.details}</p>
        <div class="findings">
          ${cat.findings.slice(0, 5).map((f: { type: string; message: string }) => {
            const icon = f.type === "success" ? "✓" : f.type === "warning" ? "⚠" : f.type === "error" ? "✗" : "ℹ";
            const color = f.type === "success" ? "#22c55e" : f.type === "warning" ? "#eab308" : f.type === "error" ? "#ef4444" : "#6b7280";
            return `<div class="finding" style="color: ${color}"><span>${icon}</span> ${f.message}</div>`;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RepoHealth Report — ${audit.owner}/${audit.repo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .no-print {
      animation: slideDown 0.5s ease;
      margin-bottom: 24px;
      padding: 14px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      text-align: center;
      font-size: 13px;
      color: #86efac;
      backdrop-filter: blur(10px);
    }

    @media print { .no-print { display: none; } body { background: white; color: #1a1a1a; } }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 48px;
      animation: fadeUp 0.8s ease;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #22d3ee, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header .repo-name {
      font-size: 18px;
      color: #94a3b8;
    }

    .header .timestamp {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    /* Score Circle */
    .score-section {
      text-align: center;
      margin-bottom: 48px;
      animation: scaleIn 0.8s ease 0.2s both;
    }

    .score-ring {
      position: relative;
      display: inline-block;
      width: 160px;
      height: 160px;
    }

    .score-ring svg {
      transform: rotate(-90deg);
    }

    .score-ring .score-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .score-ring .score-number {
      font-size: 42px;
      font-weight: 800;
      color: ${scoreColor(audit.overallScore)};
    }

    .score-ring .score-grade {
      font-size: 13px;
      color: #94a3b8;
    }

    .score-summary {
      margin-top: 16px;
      font-size: 14px;
      color: #94a3b8;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Category Cards */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #f1f5f9;
      animation: fadeUp 0.6s ease 0.3s both;
    }

    .category-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
      backdrop-filter: blur(10px);
      animation: slideUp 0.5s ease both;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
    }

    .card-icon { font-size: 20px; }

    .card-score {
      font-size: 28px;
      font-weight: 800;
    }

    .progress-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 3px;
      margin-bottom: 12px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      width: 0;
      animation: fillBar 1s ease 0.8s forwards;
    }

    .card-details {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    .findings {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .finding {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #64748b;
      animation: fadeUp 0.5s ease 1.5s both;
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes spin-in {
      from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
      to { opacity: 1; transform: rotate(-90deg) scale(1); }
    }

    @keyframes countUp {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    @keyframes fillBar {
      from { width: 0; }
      to { width: var(--target-width); }
    }

    /* Decorative background elements */
    body::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
      pointer-events: none;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-2%, 2%); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print">
      Press <strong>Ctrl+P</strong> (or Cmd+P) to save as PDF
    </div>

    <div class="header">
      <h1>🏥 Repository Health Report</h1>
      <div class="repo-name">${audit.owner}/${audit.repo}</div>
      <div class="timestamp">Audited: ${audit.timestamp.toLocaleString()}</div>
    </div>

    <div class="score-section">
      <div class="score-ring">
        <svg width="160" height="160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
          <circle cx="80" cy="80" r="70" fill="none" stroke="${scoreColor(audit.overallScore)}" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${2 * Math.PI * 70}"
            stroke-dashoffset="${2 * Math.PI * 70 * (1 - audit.overallScore / 100)}" />
        </svg>
        <div class="score-text">
          <div class="score-number">${audit.overallScore}</div>
          <div class="score-grade">Grade: ${audit.grade}</div>
        </div>
      </div>
      <div class="score-summary">
        ${audit.overallScore >= 80 ? "Excellent engineering practices across the board." :
          audit.overallScore >= 60 ? "Good foundation with room for improvement." :
          audit.overallScore >= 40 ? "Several areas need attention." :
          "Critical issues require immediate action."}
      </div>
    </div>

    <h2 class="section-title">📋 Category Breakdown</h2>
    ${categoriesHtml}

    <div class="footer">
      <p>Generated by RepoHealth Auditor • ${new Date().toLocaleDateString()}</p>
      <p style="margin-top: 4px;">github.com/${audit.owner}/${audit.repo}</p>
    </div>
  </div>
</body>
</html>`;
}
