"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven text + icon scatter animation.
 * Adapted from Skiper31 — uses scroll position to converge scattered elements.
 */

// ─── CHARACTER VARIANTS ──────────────────────────────────────────────────────

function ScatterChar({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  const isSpace = char === " ";
  const dist = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [dist * 45, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [dist * 40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.2, 1]);

  return (
    <motion.span
      className={cn("inline-block", isSpace && "w-3 md:w-5")}
      style={{ x, rotateX, opacity }}
    >
      {char}
    </motion.span>
  );
}

function RotateIcon({
  icon,
  label,
  index,
  centerIndex,
  scrollYProgress,
}: {
  icon: string;
  label: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  const dist = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.55], [dist * 80, 0]);
  const rotate = useTransform(scrollYProgress, [0, 0.55], [dist * 35, 0]);
  const y = useTransform(scrollYProgress, [0, 0.55], [-Math.abs(dist) * 25, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55], [0.6, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.15, 1]);

  return (
    <motion.div
      className="inline-flex flex-col items-center gap-2"
      style={{ x, rotate, y, scale, opacity, transformOrigin: "center" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-2xl md:h-16 md:w-16">
        {icon}
      </div>
      <span className="text-[10px] text-neutral-500">{label}</span>
    </motion.div>
  );
}

// ─── MAIN SECTION ────────────────────────────────────────────────────────────

export function ScrollRevealSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: textProgress } = useScroll({
    target: textRef,
    offset: ["start end", "center center"],
  });

  const { scrollYProgress: iconsProgress } = useScroll({
    target: iconsRef,
    offset: ["start end", "center center"],
  });

  const headline = "audit · analyze · ship";
  const chars = headline.split("");
  const charCenter = Math.floor(chars.length / 2);

  const techStack = [
    { icon: "⚡", label: "Next.js" },
    { icon: "🐙", label: "GitHub" },
    { icon: "🛡️", label: "OSV" },
    { icon: "📊", label: "Charts" },
    { icon: "🗄️", label: "Prisma" },
    { icon: "🎨", label: "Tailwind" },
    { icon: "🔐", label: "Auth" },
    { icon: "🧪", label: "CI/CD" },
    { icon: "🔧", label: "Auto-Fix" },
  ];
  const iconCenter = Math.floor(techStack.length / 2);

  return (
    <section className="relative overflow-hidden">
      {/* Scroll indicator */}
      <div className="flex justify-center pb-8 pt-16">
        <span className="relative text-[10px] uppercase tracking-[0.2em] text-neutral-500 after:absolute after:left-1/2 after:top-full after:mt-3 after:h-12 after:w-px after:bg-gradient-to-b after:from-neutral-600 after:to-transparent after:content-['']">
          Scroll to reveal
        </span>
      </div>

      {/* Text scatter — converges on scroll */}
      <div
        ref={textRef}
        className="flex min-h-[70vh] items-center justify-center px-6"
      >
        <div
          className="w-full max-w-5xl text-center text-3xl font-bold uppercase tracking-tight dark:text-cyan-400 text-orange-500 md:text-5xl lg:text-7xl"
          style={{ perspective: "600px" }}
        >
          {chars.map((char, i) => (
            <ScatterChar
              key={i}
              char={char}
              index={i}
              centerIndex={charCenter}
              scrollYProgress={textProgress}
            />
          ))}
        </div>
      </div>

      {/* Icons scatter with rotation — converges on scroll */}
      <div
        ref={iconsRef}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-10 px-6"
      >
        <div className="flex items-center gap-3 text-neutral-400">
          <Bracket className="h-10 text-neutral-600" />
          <span className="text-sm font-medium tracking-wide md:text-base">
            powered by modern tech
          </span>
          <Bracket className="h-10 scale-x-[-1] text-neutral-600" />
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-5 md:gap-7"
          style={{ perspective: "500px" }}
        >
          {techStack.map((item, i) => (
            <RotateIcon
              key={i}
              icon={item.icon}
              label={item.label}
              index={i}
              centerIndex={iconCenter}
              scrollYProgress={iconsProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BRACKET SVG ─────────────────────────────────────────────────────────────

function Bracket({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
}
