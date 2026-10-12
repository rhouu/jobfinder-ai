"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "./MotionProvider";
import {
  Sparkles,
  Briefcase,
  Search,
  CheckCircle2,
  FileText,
  Rocket,
  Compass,
  Star,
  Award,
} from "lucide-react";

export type HomeSection = "hero" | "categories" | "jobs" | "how-it-works" | "cta";

interface InteractiveHomeBackgroundProps {
  currentSection?: HomeSection;
}

export function InteractiveHomeBackground({ currentSection: controlledSection }: InteractiveHomeBackgroundProps) {
  const [section, setSection] = useState<HomeSection>(controlledSection || "hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  // Track global scroll position and detect sections cleanly via scroll boundaries & IntersectionObserver
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
          setScrollProgress(progress);

          // Detect active section if not controlled
          if (!controlledSection) {
            const heroElem = document.getElementById("section-hero");
            const catElem = document.getElementById("section-categories");
            const jobsElem = document.getElementById("section-jobs");
            const howElem = document.getElementById("section-how-it-works");
            const ctaElem = document.getElementById("section-cta");

            const checkPos = scrollY + window.innerHeight * 0.45;

            if (ctaElem && checkPos >= ctaElem.offsetTop) {
              setSection("cta");
            } else if (howElem && checkPos >= howElem.offsetTop) {
              setSection("how-it-works");
            } else if (jobsElem && checkPos >= jobsElem.offsetTop) {
              setSection("jobs");
            } else if (catElem && checkPos >= catElem.offsetTop) {
              setSection("categories");
            } else {
              setSection("hero");
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [controlledSection]);

  // Subtle mouse follow (only on desktop and non-reduced-motion)
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1 relative to center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  // Section configs: mascot coordinates (percentage of screen), rotation, scale, expression, color mood
  const sectionConfig = {
    hero: {
      mascotPos: { x: "78%", y: "24%" },
      mascotScale: 1.05,
      mascotRotate: -6 + mousePos.x * 5,
      mascotFloatY: [-6, 6],
      expression: "happy",
      accessory: "sparkle",
      bgGradient: "from-amber-50/40 via-sky-50/30 to-blue-50/40",
      accentOrbColor1: "rgba(251, 191, 36, 0.12)", // soft warm amber
      accentOrbColor2: "rgba(56, 189, 248, 0.14)", // soft sky blue
      accentOrbColor3: "rgba(99, 102, 241, 0.08)", // gentle indigo
      subtitle: "Orientation & Découverte",
    },
    categories: {
      mascotPos: { x: "85%", y: "42%" },
      mascotScale: 0.95,
      mascotRotate: 8 + mousePos.x * 4,
      mascotFloatY: [-8, 4],
      expression: "focused",
      accessory: "compass",
      bgGradient: "from-blue-50/50 via-sky-50/40 to-slate-50/60",
      accentOrbColor1: "rgba(37, 99, 235, 0.12)", // royal blue
      accentOrbColor2: "rgba(244, 244, 245, 0.8)",
      accentOrbColor3: "rgba(217, 119, 6, 0.08)", // warm amber
      subtitle: "Filières d'Excellence",
    },
    jobs: {
      mascotPos: { x: "12%", y: "58%" },
      mascotScale: 0.98,
      mascotRotate: -7 + mousePos.x * 4,
      mascotFloatY: [-5, 7],
      expression: "excited",
      accessory: "briefcase",
      bgGradient: "from-sky-50/40 via-white to-blue-50/35",
      accentOrbColor1: "rgba(16, 185, 129, 0.12)", // moroccan emerald
      accentOrbColor2: "rgba(37, 99, 235, 0.11)",
      accentOrbColor3: "rgba(251, 191, 36, 0.09)",
      subtitle: "Opportunités Récents",
    },
    "how-it-works": {
      mascotPos: { x: "82%", y: "74%" },
      mascotScale: 0.96,
      mascotRotate: 6 + mousePos.x * 4,
      mascotFloatY: [-7, 5],
      expression: "smart",
      accessory: "ai-nodes",
      bgGradient: "from-amber-50/30 via-sky-50/25 to-slate-50/50",
      accentOrbColor1: "rgba(245, 158, 11, 0.12)", // amber
      accentOrbColor2: "rgba(37, 99, 235, 0.10)",
      accentOrbColor3: "rgba(16, 185, 129, 0.09)",
      subtitle: "Étapes & IA Matching",
    },
    cta: {
      mascotPos: { x: "50%", y: "86%" },
      mascotScale: 1.15,
      mascotRotate: 0 + mousePos.x * 3,
      mascotFloatY: [-10, 8],
      expression: "cheer",
      accessory: "rocket",
      bgGradient: "from-blue-50/60 via-amber-50/40 to-sky-50/50",
      accentOrbColor1: "rgba(37, 99, 235, 0.16)",
      accentOrbColor2: "rgba(245, 158, 11, 0.15)",
      accentOrbColor3: "rgba(16, 185, 129, 0.12)",
      subtitle: "Prêt à Postuler !",
    },
  }[section];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Dynamic Ambient Mesh Canvas (Layer 1) */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${sectionConfig.bgGradient} transition-colors duration-1000 ease-out`}
      />

      {/* Floating Organic Glowing Orbs (Layer 2) */}
      {!reducedMotion && (
        <>
          <motion.div
            className="absolute rounded-full filter blur-3xl opacity-80"
            animate={{
              x: mousePos.x * 40 + Math.sin(scrollProgress * 6) * 60,
              y: mousePos.y * 30 + Math.cos(scrollProgress * 6) * 50,
              scale: [1, 1.08, 0.98, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{
              top: "8%",
              left: "15%",
              width: "480px",
              height: "480px",
              backgroundColor: sectionConfig.accentOrbColor1,
            }}
          />

          <motion.div
            className="absolute rounded-full filter blur-3xl opacity-75"
            animate={{
              x: -mousePos.x * 45 + Math.cos(scrollProgress * 5) * 50,
              y: -mousePos.y * 35 + Math.sin(scrollProgress * 5) * 60,
              scale: [1.05, 0.95, 1.05],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{
              top: "45%",
              right: "12%",
              width: "520px",
              height: "520px",
              backgroundColor: sectionConfig.accentOrbColor2,
            }}
          />

          <motion.div
            className="absolute rounded-full filter blur-3xl opacity-65"
            animate={{
              x: mousePos.x * 30,
              y: mousePos.y * 25,
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              bottom: "10%",
              left: "25%",
              width: "540px",
              height: "540px",
              backgroundColor: sectionConfig.accentOrbColor3,
            }}
          />
        </>
      )}

      {/* Floating Animated Ambient Particles & Micro Icons (Layer 3) */}
      {!reducedMotion && (
        <div className="absolute inset-0">
          {/* Subtle floating job & match badges */}
          <motion.div
            className="absolute hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm text-[11px] font-bold text-slate-700"
            style={{ top: "18%", left: "6%" }}
            animate={{
              y: [-8, 8, -8],
              rotate: [-2, 2, -2],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Offres Vérifiées</span>
          </motion.div>

          <motion.div
            className="absolute hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm text-[11px] font-bold text-blue-700"
            style={{ top: "32%", right: "8%" }}
            animate={{
              y: [8, -8, 8],
              rotate: [1, -2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Compass className="h-3.5 w-3.5 text-blue-600" />
            <span>500+ Entreprises</span>
          </motion.div>

          <motion.div
            className="absolute hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-slate-200/60 shadow-sm text-[11px] font-bold text-emerald-700"
            style={{ top: "68%", left: "8%" }}
            animate={{
              y: [-6, 6, -6],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Matching IA 94%</span>
          </motion.div>
        </div>
      )}

      {/* Signature 3D Character Mascot (JobFinder AI Bot) (Layer 4) */}
      <motion.div
        className="absolute hidden sm:block"
        animate={{
          left: sectionConfig.mascotPos.x,
          top: sectionConfig.mascotPos.y,
          scale: sectionConfig.mascotScale,
          rotate: sectionConfig.mascotRotate,
        }}
        transition={{
          type: "spring",
          stiffness: 45,
          damping: 18,
          mass: 0.9,
        }}
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          animate={reducedMotion ? {} : { y: sectionConfig.mascotFloatY }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center"
        >
          {/* Subtle Ground Shadow for 3D depth */}
          <div className="absolute -bottom-5 w-28 h-5 rounded-full bg-slate-900/10 filter blur-md" />

          {/* SVG 3D-styled Robot Mascot with Dynamic Expressions & Mood */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 filter drop-shadow-xl">
            <svg
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Gradients for rich 3D appearance */}
                <linearGradient id="bodyGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="visorGrad" x1="40" y1="50" x2="120" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0B1528" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>

                <linearGradient id="blueAccent" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>

                <linearGradient id="amberAccent" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Antenna with pulsing AI signal */}
              <line x1="80" y1="24" x2="80" y2="38" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
              <circle
                cx="80"
                cy="20"
                r="7"
                fill="url(#amberAccent)"
                filter="url(#softGlow)"
              />
              <circle cx="80" cy="20" r="3" fill="#FFFFFF" />

              {/* Robot Head with smooth 3D rounded corners */}
              <rect
                x="35"
                y="36"
                width="90"
                height="70"
                rx="24"
                fill="url(#bodyGrad)"
                stroke="#E2E8F0"
                strokeWidth="3"
              />

              {/* Ear Pods */}
              <rect x="26" y="58" width="10" height="26" rx="5" fill="url(#blueAccent)" />
              <rect x="124" y="58" width="10" height="26" rx="5" fill="url(#blueAccent)" />

              {/* Visor Screen */}
              <rect
                x="46"
                y="48"
                width="68"
                height="46"
                rx="14"
                fill="url(#visorGrad)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Interactive Eyes depending on section */}
              {section === "hero" && (
                <>
                  {/* Happy Curved Eyes */}
                  <path
                    d="M 58 68 Q 66 61 74 68"
                    stroke="#38BDF8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                  />
                  <path
                    d="M 86 68 Q 94 61 102 68"
                    stroke="#38BDF8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                  />
                </>
              )}

              {section === "categories" && (
                <>
                  {/* Curious Looking Aside Eyes */}
                  <circle cx="68" cy="68" r="6" fill="#38BDF8" filter="url(#softGlow)" />
                  <circle cx="96" cy="68" r="6" fill="#38BDF8" filter="url(#softGlow)" />
                  <circle cx="70" cy="66" r="2" fill="#FFFFFF" />
                  <circle cx="98" cy="66" r="2" fill="#FFFFFF" />
                </>
              )}

              {section === "jobs" && (
                <>
                  {/* Sparkling Excited Star Eyes */}
                  <circle cx="66" cy="68" r="7" fill="#F59E0B" filter="url(#softGlow)" />
                  <circle cx="94" cy="68" r="7" fill="#F59E0B" filter="url(#softGlow)" />
                  <circle cx="66" cy="68" r="3" fill="#FFFFFF" />
                  <circle cx="94" cy="68" r="3" fill="#FFFFFF" />
                </>
              )}

              {section === "how-it-works" && (
                <>
                  {/* Smart Analyzing Grid Eyes */}
                  <rect x="58" y="65" width="14" height="6" rx="3" fill="#10B981" filter="url(#softGlow)" />
                  <rect x="88" y="65" width="14" height="6" rx="3" fill="#10B981" filter="url(#softGlow)" />
                </>
              )}

              {section === "cta" && (
                <>
                  {/* Big Cheerful Eyes */}
                  <path
                    d="M 56 66 Q 66 58 76 66"
                    stroke="#38BDF8"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                  />
                  <path
                    d="M 84 66 Q 94 58 104 66"
                    stroke="#38BDF8"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                  />
                  <circle cx="60" cy="80" r="3" fill="#F43F5E" opacity="0.6" />
                  <circle cx="100" cy="80" r="3" fill="#F43F5E" opacity="0.6" />
                </>
              )}

              {/* Cute Smile / Mouth */}
              <path
                d="M 72 82 Q 80 88 88 82"
                stroke="#60A5FA"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Neck Joint */}
              <rect x="72" y="106" width="16" height="8" rx="3" fill="#94A3B8" />

              {/* Torso / Body */}
              <rect
                x="48"
                y="114"
                width="64"
                height="38"
                rx="16"
                fill="url(#bodyGrad)"
                stroke="#E2E8F0"
                strokeWidth="3"
              />

              {/* Heart/Core Badge on Chest */}
              <circle cx="80" cy="130" r="8" fill="url(#blueAccent)" />
              <path
                d="M 80 126 L 82 129 L 85 130 L 82 131 L 80 134 L 78 131 L 75 130 L 78 129 Z"
                fill="#FFFFFF"
              />

              {/* Hands waving or holding tools */}
              <circle cx="38" cy="128" r="7" fill="url(#bodyGrad)" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="122" cy="128" r="7" fill="url(#bodyGrad)" stroke="#CBD5E1" strokeWidth="2" />
            </svg>
          </div>

          {/* Interactive Speech Badge matching current section */}
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mt-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center gap-1.5"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[10px] font-black tracking-tight text-slate-800">
              {sectionConfig.subtitle}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
