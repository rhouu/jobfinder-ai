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
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  RotateCcw,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export type HomeSection =
  | "hero"
  | "categories"
  | "jobs"
  | "how-it-works"
  | "cta";

interface TourStep {
  id: string;
  targetId?: string;
  title: string;
  headline: string;
  message: string;
  explanation: string;
  actionLabel?: string;
  actionHref?: string;
  expression: "happy" | "focused" | "excited" | "smart" | "cheer";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "hero",
    targetId: "search-bar-form",
    title: "1. Bienvenue & Recherche",
    headline: "Hey there ! 👋 Bienvenue sur JobFinder AI",
    message: "I'm your career buddy. Tell me what you're looking for, and I'll help you discover opportunities that fit your goals.",
    explanation: "This is where your journey starts. Search for a job, an internship, or another opportunity by entering a keyword, a skill, or a job title.",
    actionLabel: "Essayer la recherche",
    expression: "happy",
  },
  {
    id: "categories",
    targetId: "section-categories",
    title: "2. Découverte des Opportunités",
    headline: "Look what we can discover! ✨",
    message: "Explore opportunities that match your interests, skills, and career goals.",
    explanation: "Here you can explore available jobs, internships, and other opportunities. Open an offer to see its requirements, company information, and application instructions.",
    actionLabel: "Voir les filières",
    actionHref: "/jobs",
    expression: "excited",
  },
  {
    id: "filters",
    targetId: "quick-filters-bar",
    title: "3. Filtres & Recherche Ciblée",
    headline: "Let's make your search more precise! 🎯",
    message: "We can narrow down the results to find opportunities that suit you better.",
    explanation: "Use the available filters to select a city, professional field, opportunity type, or other criteria supported by the platform.",
    actionLabel: "Explorer avec filtres",
    actionHref: "/jobs?type=INTERNSHIP",
    expression: "focused",
  },
  {
    id: "cv",
    targetId: "feature-search",
    title: "4. Générateur & Export CV ATS",
    headline: "Need a professional CV? 📝",
    message: "I can show you how to create one and present your skills clearly.",
    explanation: "The CV Generator helps you organize your personal information, education, skills, projects, and experience into a professional CV with 1-click ATS PDF export.",
    actionLabel: "Ouvrir l'Espace CV",
    actionHref: "/dashboard",
    expression: "smart",
  },
  {
    id: "matching",
    targetId: "feature-matching",
    title: "5. AI CV Matching & Compatibilité",
    headline: "Let's find opportunities that fit your profile! 🤖",
    message: "Your CV can help us identify relevant offers and show you which skills match.",
    explanation: "CV Matching compares your CV with available opportunities to identify relevant skills, missing requirements, and potential career matches.",
    actionLabel: "Tester le Matching",
    actionHref: "/dashboard",
    expression: "smart",
  },
  {
    id: "saved",
    targetId: "feature-apply",
    title: "6. Sauvegarde & Alertes Emploi",
    headline: "Found something interesting? ⭐",
    message: "Save it for later! You can also create job alerts to keep track of opportunities you're interested in.",
    explanation: "Saved opportunities help you keep track of offers you like with the bookmark button. Surveillance lets you activate email alerts for new openings matching your criteria.",
    actionLabel: "Mes favoris",
    actionHref: "/jobs",
    expression: "excited",
  },
  {
    id: "history",
    targetId: "section-jobs",
    title: "7. Historique & Suivi des Offres",
    headline: "No need to start from zero every time! 🔎",
    message: "Your search history helps you return to previous searches and continue where you left off.",
    explanation: "Your history and local cache keep track of your saved jobs and recently consulted companies so you can resume immediately.",
    actionLabel: "Consulter les offres",
    actionHref: "/jobs",
    expression: "focused",
  },
  {
    id: "cta",
    targetId: "section-cta",
    title: "8. Prêt pour l'Avenir",
    headline: "You're ready to go! 🚀",
    message: "Let's discover your next opportunity and take the next step in your career.",
    explanation: "Start searching, explore offers, build your CV, and use the tools available to prepare for your next opportunity.",
    actionLabel: "Lancer ma recherche",
    actionHref: "/jobs",
    expression: "cheer",
  },
];

export function InteractiveHomeBackground() {
  const [activeSection, setActiveSection] = useState<HomeSection>("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [isMascotMinimized, setIsMascotMinimized] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const reducedMotion = useReducedMotion();
  const lastSectionRef = useRef<HomeSection>("hero");

  // Load tour completion state from localStorage
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem("jobfinder_tour_seen");
      if (!tourSeen) {
        // Auto show tour prompt or start for first-time visitors
        setIsTourActive(false);
      }
    } catch {}
  }, []);

  // Track scroll position and detect sections cleanly
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
          setScrollProgress(progress);

          // Only auto-detect if interactive guided tour is NOT currently hijacking the step
          if (!isTourActive) {
            const catElem = document.getElementById("section-categories");
            const jobsElem = document.getElementById("section-jobs");
            const howElem = document.getElementById("section-how-it-works");
            const ctaElem = document.getElementById("section-cta");

            const checkPos = scrollY + window.innerHeight * 0.45;
            let currentSec: HomeSection = "hero";

            if (ctaElem && checkPos >= ctaElem.offsetTop) {
              currentSec = "cta";
            } else if (howElem && checkPos >= howElem.offsetTop) {
              currentSec = "how-it-works";
            } else if (jobsElem && checkPos >= jobsElem.offsetTop) {
              currentSec = "jobs";
            } else if (catElem && checkPos >= catElem.offsetTop) {
              currentSec = "categories";
            } else {
              currentSec = "hero";
            }

            if (currentSec !== lastSectionRef.current) {
              lastSectionRef.current = currentSec;
              setActiveSection(currentSec);
              setIsBubbleDismissed(false); // Reopen bubble smoothly on new section transition
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
  }, [isTourActive]);

  // Mouse tilt tracking
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  // Tour navigation actions
  const startTour = () => {
    setIsTourActive(true);
    setTourIndex(0);
    setIsBubbleDismissed(false);
    setIsMascotMinimized(false);
    scrollToTarget(TOUR_STEPS[0].targetId);
  };

  const endTour = () => {
    setIsTourActive(false);
    try {
      localStorage.setItem("jobfinder_tour_seen", "true");
    } catch {}
  };

  const nextTourStep = () => {
    if (tourIndex < TOUR_STEPS.length - 1) {
      const nextIdx = tourIndex + 1;
      setTourIndex(nextIdx);
      scrollToTarget(TOUR_STEPS[nextIdx].targetId);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (tourIndex > 0) {
      const prevIdx = tourIndex - 1;
      setTourIndex(prevIdx);
      scrollToTarget(TOUR_STEPS[prevIdx].targetId);
    }
  };

  const scrollToTarget = (targetId?: string) => {
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Current tour step or scroll step
  const currentTourStep = isTourActive
    ? TOUR_STEPS[tourIndex]
    : TOUR_STEPS.find((s) => s.id === activeSection) || TOUR_STEPS[0];

  // Visual ambiance mapping per section
  const sectionAmbiance = {
    hero: {
      mascotPos: { x: "78%", y: "26%" },
      mascotScale: 1.05,
      mascotRotate: -5 + mousePos.x * 4,
      bgGradient: "from-amber-50/50 via-sky-50/35 to-blue-50/45",
      accentOrbColor1: "rgba(251, 191, 36, 0.14)", // warm amber
      accentOrbColor2: "rgba(56, 189, 248, 0.15)", // sky blue
      accentOrbColor3: "rgba(99, 102, 241, 0.08)",
      titleBadge: "Étape 1 : Bienvenue & Recherche",
    },
    categories: {
      mascotPos: { x: "85%", y: "45%" },
      mascotScale: 0.98,
      mascotRotate: 6 + mousePos.x * 3,
      bgGradient: "from-blue-50/50 via-sky-50/40 to-slate-50/60",
      accentOrbColor1: "rgba(37, 99, 235, 0.12)",
      accentOrbColor2: "rgba(244, 244, 245, 0.8)",
      accentOrbColor3: "rgba(217, 119, 6, 0.09)",
      titleBadge: "Étape 2 : Filières d'Excellence",
    },
    jobs: {
      mascotPos: { x: "14%", y: "58%" },
      mascotScale: 1.0,
      mascotRotate: -7 + mousePos.x * 4,
      bgGradient: "from-sky-50/40 via-white to-blue-50/35",
      accentOrbColor1: "rgba(16, 185, 129, 0.12)", // emerald
      accentOrbColor2: "rgba(37, 99, 235, 0.11)",
      accentOrbColor3: "rgba(251, 191, 36, 0.09)",
      titleBadge: "Étape 3 : Opportunités Récentes",
    },
    "how-it-works": {
      mascotPos: { x: "84%", y: "73%" },
      mascotScale: 0.97,
      mascotRotate: 5 + mousePos.x * 3,
      bgGradient: "from-amber-50/35 via-sky-50/30 to-slate-50/50",
      accentOrbColor1: "rgba(245, 158, 11, 0.13)",
      accentOrbColor2: "rgba(37, 99, 235, 0.10)",
      accentOrbColor3: "rgba(16, 185, 129, 0.09)",
      titleBadge: "Étape 4 : Parcours & Matching IA",
    },
    cta: {
      mascotPos: { x: "50%", y: "85%" },
      mascotScale: 1.12,
      mascotRotate: 0 + mousePos.x * 2,
      bgGradient: "from-blue-50/60 via-amber-50/40 to-sky-50/50",
      accentOrbColor1: "rgba(37, 99, 235, 0.16)",
      accentOrbColor2: "rgba(245, 158, 11, 0.15)",
      accentOrbColor3: "rgba(16, 185, 129, 0.12)",
      titleBadge: "Étape Finale : Démarrez !",
    },
  }[activeSection];

  const currentExpression = isTourActive ? currentTourStep.expression : sectionAmbiance ? (activeSection === "hero" ? "happy" : activeSection === "categories" ? "focused" : activeSection === "jobs" ? "excited" : activeSection === "how-it-works" ? "smart" : "cheer") : "happy";

  return (
    <>
      {/* Dynamic Ambient Mesh Canvas (Layer 0 - Non-blocking behind content) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-b ${sectionAmbiance.bgGradient} transition-colors duration-1000 ease-out`}
        />

        {/* Floating Organic Glowing Orbs */}
        {!reducedMotion && (
          <>
            <motion.div
              className="absolute rounded-full filter blur-3xl opacity-80"
              animate={{
                x: mousePos.x * 35 + Math.sin(scrollProgress * 6) * 50,
                y: mousePos.y * 25 + Math.cos(scrollProgress * 6) * 40,
                scale: [1, 1.06, 0.98, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{
                top: "6%",
                left: "14%",
                width: "480px",
                height: "480px",
                backgroundColor: sectionAmbiance.accentOrbColor1,
              }}
            />

            <motion.div
              className="absolute rounded-full filter blur-3xl opacity-75"
              animate={{
                x: -mousePos.x * 40 + Math.cos(scrollProgress * 5) * 45,
                y: -mousePos.y * 30 + Math.sin(scrollProgress * 5) * 50,
                scale: [1.05, 0.95, 1.05],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              style={{
                top: "42%",
                right: "10%",
                width: "520px",
                height: "520px",
                backgroundColor: sectionAmbiance.accentOrbColor2,
              }}
            />

            <motion.div
              className="absolute rounded-full filter blur-3xl opacity-65"
              animate={{
                x: mousePos.x * 25,
                y: mousePos.y * 20,
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{
                bottom: "10%",
                left: "22%",
                width: "540px",
                height: "540px",
                backgroundColor: sectionAmbiance.accentOrbColor3,
              }}
            />
          </>
        )}
      </div>

      {/* Floating Career Guide Mascot + Interactive Speech Bubble (Layer 30) */}
      <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
        <motion.div
          className="absolute"
          animate={{
            left: isMascotMinimized ? "92%" : sectionAmbiance.mascotPos.x,
            top: isMascotMinimized ? "90%" : sectionAmbiance.mascotPos.y,
            scale: isMascotMinimized ? 0.65 : sectionAmbiance.mascotScale,
            rotate: isMascotMinimized ? 0 : sectionAmbiance.mascotRotate,
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
            animate={reducedMotion ? {} : { y: [-6, 6, -6] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex flex-col items-center pointer-events-auto"
          >
            {/* Mascot Toggle Button / Avatar */}
            <button
              onClick={() => setIsMascotMinimized(!isMascotMinimized)}
              className="relative group cursor-pointer focus:outline-none"
              title={isMascotMinimized ? "Ouvrir votre Guide de Carrière" : "Réduire le Guide"}
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-slate-900/10 filter blur-md" />

              {/* Robot Mascot SVG */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 filter drop-shadow-xl transition-transform group-hover:scale-105 active:scale-95">
                <svg
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="bodyGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="45%" stopColor="#F8FAFC" />
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

                  {/* Antenna */}
                  <line x1="80" y1="24" x2="80" y2="38" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="80" cy="20" r="7" fill="url(#amberAccent)" filter="url(#softGlow)" />
                  <circle cx="80" cy="20" r="3" fill="#FFFFFF" />

                  {/* Robot Head */}
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

                  {/* Dynamic Visor Eyes based on current expression */}
                  {currentExpression === "happy" && (
                    <>
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

                  {currentExpression === "focused" && (
                    <>
                      <circle cx="68" cy="68" r="6" fill="#38BDF8" filter="url(#softGlow)" />
                      <circle cx="96" cy="68" r="6" fill="#38BDF8" filter="url(#softGlow)" />
                      <circle cx="70" cy="66" r="2" fill="#FFFFFF" />
                      <circle cx="98" cy="66" r="2" fill="#FFFFFF" />
                    </>
                  )}

                  {currentExpression === "excited" && (
                    <>
                      <circle cx="66" cy="68" r="7" fill="#F59E0B" filter="url(#softGlow)" />
                      <circle cx="94" cy="68" r="7" fill="#F59E0B" filter="url(#softGlow)" />
                      <circle cx="66" cy="68" r="3" fill="#FFFFFF" />
                      <circle cx="94" cy="68" r="3" fill="#FFFFFF" />
                    </>
                  )}

                  {currentExpression === "smart" && (
                    <>
                      <rect x="58" y="65" width="14" height="6" rx="3" fill="#10B981" filter="url(#softGlow)" />
                      <rect x="88" y="65" width="14" height="6" rx="3" fill="#10B981" filter="url(#softGlow)" />
                    </>
                  )}

                  {currentExpression === "cheer" && (
                    <>
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

                  {/* Smile */}
                  <path
                    d="M 72 82 Q 80 88 88 82"
                    stroke="#60A5FA"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Neck */}
                  <rect x="72" y="106" width="16" height="8" rx="3" fill="#94A3B8" />

                  {/* Body */}
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

                  {/* Core Badge */}
                  <circle cx="80" cy="130" r="8" fill="url(#blueAccent)" />
                  <path
                    d="M 80 126 L 82 129 L 85 130 L 82 131 L 80 134 L 78 131 L 75 130 L 78 129 Z"
                    fill="#FFFFFF"
                  />

                  {/* Hands */}
                  <circle cx="38" cy="128" r="7" fill="url(#bodyGrad)" stroke="#CBD5E1" strokeWidth="2" />
                  <circle cx="122" cy="128" r="7" fill="url(#bodyGrad)" stroke="#CBD5E1" strokeWidth="2" />
                </svg>
              </div>

              {/* Status pill on mascot */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[9px] font-bold shadow-sm whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>JobBuddy</span>
              </div>
            </button>

            {/* Contextual Speech Bubble Explaining Section & Offering Guidance */}
            <AnimatePresence>
              {!isMascotMinimized && !isBubbleDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.92 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 w-72 sm:w-84 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-xl text-left pointer-events-auto"
                >
                  {/* Bubble Pointer Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                  {/* Header Row: Guide Title & Dismiss */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                        {currentTourStep.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsBubbleDismissed(true)}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Masquer le message"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Headline & Core Message */}
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {currentTourStep.headline}
                  </h4>
                  <p className="text-[11px] font-semibold text-blue-900/90 mt-1 leading-relaxed">
                    &ldquo;{currentTourStep.message}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {currentTourStep.explanation}
                  </p>

                  {/* Action Link or Spotlight Trigger */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isTourActive ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold text-slate-400">
                          {tourIndex + 1} / {TOUR_STEPS.length}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {tourIndex > 0 && (
                            <button
                              onClick={prevTourStep}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              Retour
                            </button>
                          )}
                          <button
                            onClick={nextTourStep}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {tourIndex === TOUR_STEPS.length - 1 ? "Terminer" : "Suivant"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={startTour}
                          className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>Visite guidée</span>
                        </button>

                        {currentTourStep.actionHref ? (
                          <a
                            href={currentTourStep.actionHref}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <span>{currentTourStep.actionLabel || "Explorer"}</span>
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <button
                            onClick={() => scrollToTarget(currentTourStep.targetId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <span>{currentTourStep.actionLabel || "Voir l'outil"}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Tour Floating Controller (Bottom Left) */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        {!isTourActive ? (
          <button
            onClick={startTour}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 shadow-lg backdrop-blur-md text-xs font-black text-slate-800 hover:text-blue-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Lancer la visite interactive avec le robot guide"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Guide Interactif</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 border border-blue-200 shadow-xl backdrop-blur-md">
            <button
              onClick={prevTourStep}
              disabled={tourIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              title="Étape précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-black text-blue-700 px-2">
              Étape {tourIndex + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={nextTourStep}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
              title="Étape suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={endTour}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer ml-1"
              title="Quitter la visite"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isBubbleDismissed && !isMascotMinimized && (
          <button
            onClick={() => setIsBubbleDismissed(false)}
            className="p-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200 shadow-md text-slate-600 hover:text-blue-600 cursor-pointer"
            title="Afficher les explications du guide"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}
