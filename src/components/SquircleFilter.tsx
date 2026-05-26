"use client";

/**
 * Squircle SVG Filter — gives elements smooth iOS-style super-ellipse corners.
 * Adapted from Skiper63. Add this to layout, then use style={{filter: "url(#squircle)"}} on any element.
 */
export default function SquircleFilter() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none fixed bottom-0 left-0 h-0 w-0"
      aria-hidden="true"
    >
      <defs>
        <filter id="squircle">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
        {/* Softer version for smaller elements */}
        <filter id="squircle-sm">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}
