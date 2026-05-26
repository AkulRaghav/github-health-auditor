"use client";

import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";

/**
 * Floating code symbols canvas — developer-themed ambient background.
 * Adapted from Skiper39 CrowdCanvas pattern.
 * Instead of sprite sheets, renders text glyphs that drift across the canvas.
 */

interface Symbol {
  text: string;
  x: number;
  y: number;
  anchorY: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
  walk: gsap.core.Timeline | null;
}

const CODE_SYMBOLS = [
  "{}", "</>", "//", "#", "git", "npm", "=>", "&&", "||",
  "[]", "()", "**", "++", "fn", "let", "if", "0x", "::","CI", "CD",
  "PR", "API", "SHA", "env", "src", "pkg",
];

export default function FloatingCodeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stage = { width: 0, height: 0 };
    const symbols: Symbol[] = [];
    const SYMBOL_COUNT = 30;

    const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

    const createSymbol = (): Symbol => {
      const size = randomRange(10, 18);
      return {
        text: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
        x: 0,
        y: 0,
        anchorY: 0,
        size,
        opacity: randomRange(0.08, 0.25),
        speed: randomRange(0.5, 1.5),
        direction: Math.random() > 0.5 ? 1 : -1,
        walk: null,
      };
    };

    const resetSymbol = (sym: Symbol) => {
      const offsetY = randomRange(50, stage.height - 50);
      sym.y = offsetY;
      sym.anchorY = offsetY;

      if (sym.direction === 1) {
        sym.x = -50;
      } else {
        sym.x = stage.width + 50;
      }
    };

    const animateSymbol = (sym: Symbol) => {
      if (sym.walk) sym.walk.kill();

      resetSymbol(sym);

      const endX = sym.direction === 1 ? stage.width + 50 : -50;
      const duration = randomRange(15, 30) / sym.speed;
      const yDrift = randomRange(5, 15);

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.6, 1.2));

      tl.to(sym, {
        duration,
        x: endX,
        ease: "none",
      }, 0);

      tl.to(sym, {
        duration: randomRange(2, 4),
        repeat: Math.ceil(duration / 3),
        yoyo: true,
        y: sym.anchorY - yDrift,
        ease: "sine.inOut",
      }, 0);

      tl.eventCallback("onComplete", () => {
        sym.direction = Math.random() > 0.5 ? 1 : -1;
        sym.text = CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)];
        sym.opacity = randomRange(0.08, 0.25);
        animateSymbol(sym);
      });

      sym.walk = tl;
      return tl;
    };

    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);

      symbols.forEach((sym) => {
        ctx.save();
        ctx.globalAlpha = sym.opacity;
        ctx.font = `${sym.size}px monospace`;
        // Detect theme from document class
        const isDark = document.documentElement.classList.contains("dark");
        ctx.fillStyle = isDark ? "#22d3ee" : "#c2410c"; // cyan in dark, burnt orange in light
        ctx.fillText(sym.text, sym.x, sym.y);
        ctx.restore();
      });

      ctx.restore();
    };

    const resize = () => {
      if (!canvas) return;
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      // Kill existing animations
      symbols.forEach((sym) => {
        if (sym.walk) sym.walk.kill();
      });

      // Re-animate all
      symbols.forEach((sym) => {
        const tl = animateSymbol(sym);
        tl.progress(Math.random()); // Stagger start positions
      });
    };

    const init = () => {
      // Create symbols
      for (let i = 0; i < SYMBOL_COUNT; i++) {
        symbols.push(createSymbol());
      }
      resize();
      gsap.ticker.add(render);
    };

    init();

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(render);
      symbols.forEach((sym) => {
        if (sym.walk) sym.walk.kill();
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
