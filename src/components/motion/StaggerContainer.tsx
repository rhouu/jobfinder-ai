"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "./MotionProvider";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
  baseDelayMs?: number;
  durationMs?: number;
  threshold?: number;
}

/**
 * StaggerContainer automatically wraps its direct children in sequential fade-up reveals
 * when the container reaches the viewport.
 */
export function StaggerContainer({
  children,
  className = "",
  staggerMs = 60,
  baseDelayMs = 0,
  durationMs = 500,
  threshold = 0.1,
}: StaggerContainerProps) {
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

    return () => observer.disconnect();
  }, [threshold, reducedMotion]);

  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => {
        if (reducedMotion) {
          return <React.Fragment key={index}>{child}</React.Fragment>;
        }

        const delay = baseDelayMs + index * staggerMs;

        return (
          <div
            key={index}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translate3d(0, 0, 0)" : "translate3d(0, 20px, 0)",
              transitionProperty: "opacity, transform",
              transitionDuration: `${durationMs}ms`,
              transitionDelay: `${delay}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: isVisible ? "auto" : "opacity, transform",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
