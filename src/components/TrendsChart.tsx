"use client";

import { useEffect, useRef } from "react";

interface TrendPoint {
  score: number;
  grade: string;
  timestamp: string;
}

interface TrendsChartProps {
  trends: TrendPoint[];
  owner: string;
  repo: string;
}

export default function TrendsChart({ trends, owner, repo }: TrendsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    if (trends.length < 2 || !canvasRef.current) return;

    // Destroy existing chart before creating new one
    if (chartRef.current && typeof (chartRef.current as { destroy: () => void }).destroy === "function") {
      (chartRef.current as { destroy: () => void }).destroy();
      chartRef.current = null;
    }

    let mounted = true;

    import("chart.js/auto").then(({ default: Chart }) => {
      if (!mounted || !canvasRef.current) return;

      const labels = trends.map((t) =>
        new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Health Score",
            data: trends.map((t) => t.score),
            borderColor: "rgb(34, 211, 238)",
            backgroundColor: "rgba(34, 211, 238, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(34, 211, 238)",
            pointRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666" } },
            y: { min: 0, max: 100, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666" } },
          },
        },
      });
    });

    return () => {
      mounted = false;
      if (chartRef.current && typeof (chartRef.current as { destroy: () => void }).destroy === "function") {
        (chartRef.current as { destroy: () => void }).destroy();
        chartRef.current = null;
      }
    };
  }, [trends]);

  if (trends.length < 2) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
        <p className="text-neutral-400">
          Need at least 2 audits to show trends. Audit this repo again later to see progress.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
      <h3 className="mb-2 text-xl font-semibold">📈 Score Trends</h3>
      <p className="mb-6 text-sm text-neutral-400">
        {owner}/{repo} — Health score over time
      </p>
      <div className="h-64">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
