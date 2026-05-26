"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring } from "framer-motion";

/**
 * Realistic cat silhouette with white outline — proper anatomy, 
 * jointed legs (upper + lower segments), curved spine, detailed head.
 * Walks with natural quadruped gait toward cursor.
 */

export default function CursorCat() {
  const [facingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [frame, setFrame] = useState(0);
  const lastMouseX = useRef(0);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  const catX = useSpring(0, { stiffness: 22, damping: 14, mass: 1.5 });
  const catY = useSpring(0, { stiffness: 22, damping: 14, mass: 1.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    catX.set(e.clientX - 30);
    catY.set(e.clientY + 20);

    if (e.clientX < lastMouseX.current - 3) setFacingLeft(true);
    else if (e.clientX > lastMouseX.current + 3) setFacingLeft(false);
    lastMouseX.current = e.clientX;

    setIsMoving(true);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setIsMoving(false), 250);
  }, [catX, catY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [handleMouseMove]);

  // Walk cycle
  useEffect(() => {
    if (!isMoving || isJumping) { setFrame(0); return; }
    const id = setInterval(() => setFrame((f) => (f + 1) % 12), 70);
    return () => clearInterval(id);
  }, [isMoving, isJumping]);

  // Random jump
  useEffect(() => {
    const id = setInterval(() => {
      if (isMoving && !isJumping) {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 500);
      }
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [isMoving, isJumping]);

  // Leg joint calculation — upper leg + lower leg with knee
  const getLeg = (hipX: number, hipY: number, phase: number, isBack: boolean) => {
    const t = (frame / 12) * Math.PI * 2 + phase;
    const stride = isMoving && !isJumping ? 1 : 0;
    const upperLen = isBack ? 10 : 9;
    const lowerLen = isBack ? 11 : 10;

    // Upper leg angle (from hip)
    const upperAngle = stride * Math.sin(t) * 28;
    // Knee bends more when leg is behind (pushing off)
    const kneeExtra = stride * Math.max(0, -Math.sin(t)) * 20;

    if (isJumping) {
      // Tucked pose
      const tuckUpper = isBack ? -35 : 30;
      const tuckKnee = isBack ? 50 : -40;
      const uRad = (tuckUpper * Math.PI) / 180;
      const kneeX = hipX + Math.sin(uRad) * upperLen;
      const kneeY = hipY + Math.cos(uRad) * upperLen;
      const kRad = ((tuckUpper + tuckKnee) * Math.PI) / 180;
      const pawX = kneeX + Math.sin(kRad) * lowerLen;
      const pawY = kneeY + Math.cos(kRad) * lowerLen;
      return { kneeX, kneeY, pawX, pawY };
    }

    const uRad = (upperAngle * Math.PI) / 180;
    const kneeX = hipX + Math.sin(uRad) * upperLen;
    const kneeY = hipY + Math.cos(uRad) * upperLen;

    // Lower leg — hangs down with knee bend
    const lowerAngle = upperAngle + 10 + kneeExtra;
    const lRad = (lowerAngle * Math.PI) / 180;
    const pawX = kneeX + Math.sin(lRad) * lowerLen;
    const pawY = kneeY + Math.cos(lRad) * lowerLen;

    return { kneeX, kneeY, pawX, pawY };
  };

  // Diagonal gait: FL+BR are in phase, FR+BL are offset by π
  const frontLeft = getLeg(20, 38, 0, false);
  const frontRight = getLeg(26, 38, Math.PI, false);
  const backLeft = getLeg(44, 40, Math.PI, true);
  const backRight = getLeg(50, 40, 0, true);

  // Body bob
  const bob = isMoving && !isJumping ? Math.sin((frame / 12) * Math.PI * 2) * 1.2 : 0;
  // Spine flex
  const spineFlex = isMoving && !isJumping ? Math.sin((frame / 12) * Math.PI * 2) * 1.5 : 0;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      style={{ x: catX, y: catY }}
    >
      <motion.div
        animate={{
          y: isJumping ? -35 : 0,
          rotate: isJumping ? (facingLeft ? -15 : 15) : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      >
        <svg
          width="64"
          height="60"
          viewBox="0 0 72 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: facingLeft ? "scaleX(-1)" : "scaleX(1)" }}
          className="opacity-70 text-neutral-800 dark:text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]"
        >
          <g transform={`translate(0, ${bob})`}>
            {/* === TAIL === */}
            <motion.path
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isJumping
                  ? "M54 36C60 30 64 24 60 18"
                  : isMoving
                  ? `M54 38C${58 + Math.sin(frame * 0.5) * 3} ${34 - Math.sin(frame * 0.4) * 2} ${62 + Math.sin(frame * 0.3) * 2} ${28 + Math.cos(frame * 0.6) * 3} ${58 + Math.sin(frame * 0.7) * 4} ${22 + Math.sin(frame * 0.5) * 2}`
                  : "M54 38C56 36 57 32 55 28C53 24 54 22 56 20",
              }}
              transition={{ duration: 0.06 }}
            />

            {/* === BODY (curved spine) === */}
            <motion.path
              d={`M18 ${36 + spineFlex * 0.3}C24 ${34 - spineFlex * 0.5} 40 ${34 + spineFlex * 0.5} 52 ${36 - spineFlex * 0.3}`}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Body volume — belly curve */}
            <motion.path
              d={`M20 ${38 - spineFlex * 0.2}C28 ${44 + spineFlex * 0.3} 42 ${44 - spineFlex * 0.3} 52 ${38 + spineFlex * 0.2}`}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* === CHEST === */}
            <path
              d="M18 36C16 38 16 42 18 44C20 46 24 46 26 44"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* === HAUNCHES === */}
            <path
              d="M46 36C50 38 52 42 50 46C48 48 44 48 42 46"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* === HEAD === */}
            <g transform="translate(-2, -1)">
              {/* Skull shape */}
              <path
                d="M8 30C4 28 2 24 4 20C6 16 10 14 14 14C18 14 22 16 22 20C22 24 20 28 16 30C14 32 10 32 8 30Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Ears — triangular, pointed */}
              <path d="M8 16L5 8L11 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 14L18 6L21 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Inner ear lines */}
              <path d="M7 14L6 10L9 13" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
              <path d="M17 13L18 8L20 12" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
              {/* Muzzle */}
              <path d="M8 26C10 28 14 28 16 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              {/* Nose */}
              <path d="M11 25L12 26L13 25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              {/* Whiskers */}
              <line x1="7" y1="24" x2="0" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <line x1="7" y1="26" x2="0" y2="26" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <line x1="7" y1="28" x2="1" y2="30" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <line x1="17" y1="24" x2="24" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <line x1="17" y1="26" x2="24" y2="26" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <line x1="17" y1="28" x2="23" y2="30" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
            </g>

            {/* === LEGS (jointed: upper + lower + paw) === */}
            {/* Front-left */}
            <line x1={20} y1={38} x2={frontLeft.kneeX} y2={frontLeft.kneeY} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1={frontLeft.kneeX} y1={frontLeft.kneeY} x2={frontLeft.pawX} y2={frontLeft.pawY} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <ellipse cx={frontLeft.pawX} cy={frontLeft.pawY + 1} rx="2" ry="1.2" stroke="currentColor" strokeWidth="0.8" />

            {/* Front-right */}
            <line x1={26} y1={38} x2={frontRight.kneeX} y2={frontRight.kneeY} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            <line x1={frontRight.kneeX} y1={frontRight.kneeY} x2={frontRight.pawX} y2={frontRight.pawY} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
            <ellipse cx={frontRight.pawX} cy={frontRight.pawY + 1} rx="2" ry="1.2" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />

            {/* Back-left */}
            <line x1={44} y1={40} x2={backLeft.kneeX} y2={backLeft.kneeY} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1={backLeft.kneeX} y1={backLeft.kneeY} x2={backLeft.pawX} y2={backLeft.pawY} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.6" />
            <ellipse cx={backLeft.pawX} cy={backLeft.pawY + 1} rx="2.2" ry="1.3" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />

            {/* Back-right */}
            <line x1={50} y1={40} x2={backRight.kneeX} y2={backRight.kneeY} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1={backRight.kneeX} y1={backRight.kneeY} x2={backRight.pawX} y2={backRight.pawY} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <ellipse cx={backRight.pawX} cy={backRight.pawY + 1} rx="2.2" ry="1.3" stroke="currentColor" strokeWidth="0.8" />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
