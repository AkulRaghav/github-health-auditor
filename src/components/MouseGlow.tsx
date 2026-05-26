"use client";

import { motion, useSpring } from "framer-motion";
import React from "react";

const SPRING = {
  mass: 0.2,
  damping: 15,
  stiffness: 120,
};

export default function MouseGlow() {
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, { mass: 0.1, damping: 20, stiffness: 100 });

  return (
    <div
      onPointerMove={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        xSpring.set(e.clientX - bounds.left - 150);
        ySpring.set(e.clientY - bounds.top - 150);
      }}
      onPointerEnter={() => {
        opacitySpring.set(1);
      }}
      onPointerLeave={() => {
        opacitySpring.set(0);
      }}
      className="pointer-events-auto absolute inset-0 overflow-hidden"
    >
      <motion.div
        style={{
          x: xSpring,
          y: ySpring,
          opacity: opacitySpring,
        }}
        className="pointer-events-none h-[300px] w-[300px] rounded-full blur-3xl dark:bg-cyan-500/[0.08] bg-orange-400/[0.12]"
      />
    </div>
  );
}
