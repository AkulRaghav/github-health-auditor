"use client";

import NumberFlow from "@number-flow/react";
import { motion, useSpring } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: string;
}

const stats: StatItem[] = [
  { value: 7, suffix: "+", label: "Analysis Dimensions", icon: "📊" },
  { value: 100, suffix: "K+", label: "Vulnerabilities Scanned", icon: "🛡️" },
  { value: 8, suffix: "", label: "Auto-Fix Files Generated", icon: "🔧" },
  { value: 15, suffix: "", label: "API Endpoints", icon: "⚡" },
];

function AnimatedStat({ stat, delay }: { stat: StatItem; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.3 });

  const springValue = useSpring(0, { bounce: 0, duration: 1200 });

  useEffect(() => {
    springValue.on("change", (v) => setDisplayValue(Math.round(v)));
  }, [springValue]);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => springValue.set(stat.value), delay);
      return () => clearTimeout(timer);
    } else {
      springValue.set(0);
    }
  }, [inView, stat.value, springValue, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none"
    >
      <span className="text-2xl">{stat.icon}</span>
      <div className="text-3xl font-bold tabular-nums dark:text-cyan-400 text-orange-500 md:text-4xl">
        <NumberFlow
          value={displayValue}
          prefix={stat.prefix}
          suffix={stat.suffix}
        />
      </div>
      <span className="text-center text-sm text-neutral-500">{stat.label}</span>
    </motion.div>
  );
}

export default function AnimatedStats({ className }: { className?: string }) {
  return (
    <section className={cn("px-6 py-16", className)}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">By the Numbers</h2>
          <p className="mt-2 text-neutral-500">What happens when you run an audit</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <AnimatedStat key={stat.label} stat={stat} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}
