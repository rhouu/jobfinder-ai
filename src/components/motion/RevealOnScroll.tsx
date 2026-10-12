"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "./MotionProvider";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  yOffset?: number;
  direction?: "up" | "down" | "fade";
  threshold?: number;
}

/**
 * RevealOnScroll provides a lightweight, buttery-smooth reveal using
 * IntersectionObserver and standard GPU-accelerated CSS transforms/opacity.
 * It strictly honors prefers-reduced-motion and animates exactly once per page load.
 */
export function RevealOnScroll({
  children,
  className = "",
  delayMs = 0,
  durationMs = 600,
  yOffset = 24,
  direction = "up",
  threshold = 0.15,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // If IntersectionObserver is not supported, reveal immediately
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0)";
    if (direction === "up") return `translate3d(0, ${yOffset}px, 0)`;
    if (direction === "down") return `translate3d(0, -${yOffset}px, 0)`;
    return "translate3d(0, 0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Premium smooth ease-out
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
