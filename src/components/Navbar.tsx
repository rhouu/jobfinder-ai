"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Locale } from "@/lib/translations";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  Building2,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN";
}

export function Navbar() {
  const { t, locale, setLocale, dir } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "fr", label: "FR", flag: "🇲🇦" },
    { code: "en", label: "EN", flag: "🇬🇧" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm bg-white border-b border-slate-200">
      {/* Main Clean Navigation Bar - Sans Bandeau Supérieur */}
      <div className="w-full px-4 sm:px-8 lg:px-14 py-3.5 flex items-center justify-between">
        {/* Brand Logo with Moroccan Official Seal Motif */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-md border border-slate-700/50">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
              JobFinder <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Maroc & International
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-slate-700">
          <Link
            href="/jobs?type=JOB"
            className="hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 py-1 transition-all"
          >
            {t.nav.findJobs}
          </Link>

          <Link
            href="/jobs?type=INTERNSHIP"
            className="hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 py-1 transition-all"
          >
            {t.nav.internships}
          </Link>

          <Link
            href="/companies"
            className="hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 py-1 transition-all"
          >
            Entreprises qui recrutent
          </Link>

          <Link
            href="/employer"
            className="hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 py-1 transition-all"
          >
            {t.nav.forEmployers}
          </Link>
        </nav>

        {/* Right Actions: Langues, Connexion & Profil */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>{languages.find((l) => l.code === locale)?.label}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div
                className={`absolute ${
                  dir === "rtl" ? "left-0" : "right-0"
                } mt-2 w-32 rounded-lg border border-slate-200 bg-white p-1 text-slate-800 shadow-xl z-50`}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold ${
                      locale === l.code
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 hover:border-blue-600"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
                <span className="text-[10px] rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 font-bold border border-blue-200">
                  {user.role}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className={`absolute ${
                    dir === "rtl" ? "left-0" : "right-0"
                  } mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50`}
                >
                  <Link
                    href={
                      user.role === "EMPLOYER"
                        ? "/employer"
                        : user.role === "ADMIN"
                        ? "/admin"
                        : "/dashboard"
                    }
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    Mon Espace ({user.role})
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3 font-bold text-slate-800 text-sm">
            <Link
              href="/jobs?type=JOB"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              {t.nav.findJobs}
            </Link>
            <Link
              href="/jobs?type=INTERNSHIP"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              {t.nav.internships}
            </Link>
            <Link
              href="/companies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              Entreprises qui recrutent
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              href="/employer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-blue-600"
            >
              {t.nav.forEmployers}
            </Link>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Langue :</span>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      locale === l.code
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl border border-red-200 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/20"
                  >
                    Créer un compte
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
