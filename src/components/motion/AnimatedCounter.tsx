"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "./MotionProvider";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * AnimatedCounter gently increments from 0 to `value` once when scrolled into view.
 */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  durationMs = 900,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayCount(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setDisplayCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasStarted(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [value, reducedMotion]);

  useEffect(() => {
    if (!hasStarted || reducedMotion) return;

    let startTime: number | null = null;
    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.floor(eased * value));

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        setDisplayCount(value);
      }
    };

    animFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animFrame);
  }, [hasStarted, value, durationMs, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayCount.toLocaleString()}
      {suffix}
    </span>
  );
}
