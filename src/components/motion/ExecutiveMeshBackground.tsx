"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./MotionProvider";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle,
} from "lucide-react";

export function ExecutiveMeshBackground() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      targetX = 50;
      targetY = 50;
      setIsHovered(false);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(animate);
    };

    const container = containerRef.current;
    if (container) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.body.addEventListener("mouseleave", handleMouseLeave);
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Deep Royal Navy Gradient Canvas Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D17] via-[#0B1528] to-[#0E1E38]" />

      {/* 2. Interactive Spotlight Follower (Radial Gradient beam) */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            background: `radial-gradient(750px circle at ${mousePos.x}% ${mousePos.y}%, rgba(37, 99, 235, 0.28), rgba(2, 132, 199, 0.12) 40%, transparent 75%)`,
            opacity: isHovered ? 1 : 0.65,
          }}
        />
      )}

      {/* 3. High-Tech Precision Grid with Cursor-Responsive Radial Mask */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: prefersReducedMotion
            ? "radial-gradient(circle at center, black 40%, transparent 85%)"
            : `radial-gradient(550px circle at ${mousePos.x}% ${mousePos.y}%, black 25%, transparent 80%)`,
          WebkitMaskImage: prefersReducedMotion
            ? "radial-gradient(circle at center, black 40%, transparent 85%)"
            : `radial-gradient(550px circle at ${mousePos.x}% ${mousePos.y}%, black 25%, transparent 80%)`,
        }}
      />

      {/* 4. Ambient Drifting Aurora Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb 1: Royal Blue Ambient Glow (Top Left) */}
        <div
          className={`absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-[120px] ${
            prefersReducedMotion ? "" : "animate-pulse"
          }`}
          style={{ animationDuration: "8s" }}
        />

        {/* Orb 2: Sky Cyan Light Accent (Center Right) */}
        <div
          className={`absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-sky-500/18 blur-[110px] ${
            prefersReducedMotion ? "" : "animate-pulse"
          }`}
          style={{ animationDuration: "11s" }}
        />

        {/* Orb 3: Moroccan Warm Amber Touch (Bottom Subtle 6% Glow) */}
        <div
          className="absolute -bottom-28 left-1/3 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[130px]"
          style={{ animationDuration: "14s" }}
        />
      </div>

      {/* 5. Minimal Moroccan Subtle Geometric Lattice (Subtle 4% opacity watermark) */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.04] text-white"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.8" />
        <rect x="50" y="50" width="100" height="100" stroke="currentColor" strokeWidth="0.8" />
        <rect x="50" y="50" width="100" height="100" stroke="currentColor" strokeWidth="0.8" transform="rotate(45 100 100)" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
      </svg>

      {/* 6. Floating Executive Telemetry Chips (Desktop Side Badges with Interactive Parallax) */}
      <div className="hidden xl:block absolute inset-0 max-w-7xl mx-auto px-6 pointer-events-none">
        {/* Left Chip 1: Moroccan Cities & Hubs */}
        <div
          className="absolute top-16 left-4 transition-transform duration-500 ease-out"
          style={{
            transform: prefersReducedMotion
              ? "none"
              : `translate3d(${(mousePos.x - 50) * -0.15}px, ${(mousePos.y - 50) * -0.15}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/15 text-slate-200 shadow-xl shadow-black/20 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 -ml-4" />
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span>Casablanca • Rabat • Tanger</span>
          </div>
        </div>

        {/* Left Chip 2: Live Verified Offers */}
        <div
          className="absolute top-56 left-8 transition-transform duration-500 ease-out"
          style={{
            transform: prefersReducedMotion
              ? "none"
              : `translate3d(${(mousePos.x - 50) * -0.22}px, ${(mousePos.y - 50) * -0.22}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/15 text-slate-200 shadow-xl shadow-black/20 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Offres Vérifiées & Rémunérées</span>
          </div>
        </div>

        {/* Right Chip 1: AI ATS Score & Matching */}
        <div
          className="absolute top-20 right-4 transition-transform duration-500 ease-out"
          style={{
            transform: prefersReducedMotion
              ? "none"
              : `translate3d(${(mousePos.x - 50) * 0.18}px, ${(mousePos.y - 50) * 0.18}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/15 text-slate-200 shadow-xl shadow-black/20 text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Analyse IA & Matching ATS Instantané</span>
          </div>
        </div>

        {/* Right Chip 2: Moroccan Leading Employers */}
        <div
          className="absolute top-60 right-8 transition-transform duration-500 ease-out"
          style={{
            transform: prefersReducedMotion
              ? "none"
              : `translate3d(${(mousePos.x - 50) * 0.24}px, ${(mousePos.y - 50) * 0.24}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/15 text-slate-200 shadow-xl shadow-black/20 text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-blue-400" />
            <span>OCP • Attijari • Capgemini • Inwi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
