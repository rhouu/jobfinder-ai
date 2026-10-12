"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "./MotionProvider";

interface SubtleParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // e.g. -0.08 or 0.08
}

/**
 * SubtleParallax applies a minimal, elegant translateY shift based on window scroll.
 * Strictly checks reduced-motion and will disable parallax if enabled.
 */
export function SubtleParallax({
  children,
  className = "",
  speed = -0.06,
}: SubtleParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            // Calculate how far the center of the element is from the center of the viewport
            const windowHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const diff = elementCenter - windowHeight / 2;
            // Bound the movement so it never looks disconnected
            const boundedShift = Math.max(-25, Math.min(25, diff * speed));
            setOffsetY(boundedShift);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed, reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${offsetY}px, 0)`,
        willChange: "transform",
        transition: "transform 0.1s cubic-bezier(0, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
}
