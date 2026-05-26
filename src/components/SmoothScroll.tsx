"use client";

import { ReactNode } from "react";

/**
 * Lightweight scroll wrapper.
 * Lenis was causing significant lag on page transitions and scroll jank.
 * Replaced with native CSS smooth scroll which is GPU-accelerated.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
