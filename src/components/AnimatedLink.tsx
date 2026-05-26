"use client";

import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Internal navigation link with underline slide-in from left on hover
 */
export function NavLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center",
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
    >
      {children}
    </Link>
  );
}

/**
 * External link with underline + arrow icon reveal on hover
 */
export function ExternalAnimatedLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex items-center",
        "before:pointer-events-none before:absolute before:left-0 before:top-[1.4em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
    >
      {children}
      <svg
        className="ml-[0.3em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

/**
 * Highlight link — white background expands from center on hover (mix-blend-difference)
 * Great for CTA-style links
 */
export function HighlightLink({
  children,
  href,
  className,
  external = false,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
}) {
  const Tag = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Tag
      href={href}
      {...extraProps}
      className={cn(
        "group relative flex items-center px-2",
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:z-[1] before:h-0 before:w-full before:scale-x-100 before:bg-white before:mix-blend-difference before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:content-['']",
        "before:origin-center hover:before:h-[1.4em]",
        className
      )}
    >
      {children}
      <svg
        className="z-[2] ml-[0.5em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  );
}

/**
 * Slide-in link — white background slides from left on hover
 * Good for nav items that need emphasis
 */
export function SlideLink({
  children,
  href,
  className,
  external = false,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
}) {
  const Tag = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Tag
      href={href}
      {...extraProps}
      className={cn(
        "group relative flex items-center px-2",
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-[1] before:h-full before:w-full before:origin-left before:scale-x-0 before:bg-white before:mix-blend-difference before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:content-['']",
        "hover:before:scale-x-100",
        className
      )}
    >
      {children}
      <svg
        className="z-[2] ml-[0.5em] size-[0.55em] -translate-x-1 rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  );
}
