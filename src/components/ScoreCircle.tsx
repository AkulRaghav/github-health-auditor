"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  grade: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreCircle({ score, grade, size = "lg" }: ScoreCircleProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const sizeMap = { sm: 100, md: 140, lg: 200 };
  const strokeMap = { sm: 6, md: 8, lg: 10 };
  const dim = sizeMap[size];
  const stroke = strokeMap[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";

  useEffect(() => {
    if (circleRef.current && numberRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: circumference - (score / 100) * circumference, duration: 1.5, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(
        numberRef.current,
        { innerText: 0 },
        {
          innerText: score,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.3,
          snap: { innerText: 1 },
          onUpdate() {
            if (numberRef.current) {
              numberRef.current.textContent = Math.round(gsap.getProperty(numberRef.current, "innerText") as number).toString();
            }
          },
        }
      );
    }
  }, [score, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          ref={circleRef}
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          ref={numberRef}
          className={cn(
            "font-bold",
            size === "lg" ? "text-5xl" : size === "md" ? "text-3xl" : "text-xl"
          )}
          style={{ color }}
        >
          0
        </span>
        <span className={cn("text-neutral-400", size === "lg" ? "text-sm" : "text-xs")}>
          Grade: {grade}
        </span>
      </div>
    </div>
  );
}
