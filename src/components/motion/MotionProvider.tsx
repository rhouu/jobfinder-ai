"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MotionContextType {
  prefersReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({ prefersReducedMotion: false });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  return (
    <MotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(MotionContext).prefersReducedMotion;
}
