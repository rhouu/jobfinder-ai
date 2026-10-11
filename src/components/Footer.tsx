"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3.5 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D2B45] text-white">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-xl font-black text-[#0D2B45] tracking-tight">
                JobFinder <span className="text-[#1E5A6E]">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed text-xs font-normal">
              Portail de recrutement et stages certifié pour étudiants, lauréats et professionnels au Royaume du Maroc et à l&apos;international.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#0D2B45] font-bold">
              <ShieldCheck className="h-4 w-4 text-[#1E5A6E]" />
              <span>Données certifiées & sources officielles</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-black text-[#0D2B45] mb-3.5 uppercase tracking-wider">Opportunités</h4>
            <ul className="space-y-2.5 font-semibold text-slate-600">
              <li>
                <Link href="/jobs" className="hover:text-[#0D2B45] transition-colors">
                  {t.nav.findJobs}
                </Link>
              </li>
              <li>
                <Link href="/jobs?type=INTERNSHIP" className="hover:text-[#0D2B45] transition-colors">
                  {t.nav.internships}
                </Link>
              </li>
              <li>
                <Link href="/jobs?arrangement=REMOTE" className="hover:text-[#0D2B45] transition-colors">
                  Emplois en Télétravail
                </Link>
              </li>
              <li>
                <Link href="/jobs?city=Casablanca" className="hover:text-[#0D2B45] transition-colors">
                  Offres à Casablanca
                </Link>
              </li>
              <li>
                <Link href="/jobs?city=Rabat" className="hover:text-[#0D2B45] transition-colors">
                  Offres à Rabat & Salé
                </Link>
              </li>
            </ul>
          </div>

          {/* Candidates & Recruiters */}
          <div>
            <h4 className="text-sm font-black text-[#0D2B45] mb-3.5 uppercase tracking-wider">Services & IA</h4>
            <ul className="space-y-2.5 font-semibold text-slate-600">
              <li>
                <Link href="/dashboard" className="hover:text-[#0D2B45] transition-colors">
                  Analyseur IA de CV
                </Link>
              </li>
              <li>
                <Link href="/employer" className="hover:text-[#0D2B45] transition-colors">
                  {t.nav.forEmployers}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0D2B45] transition-colors">
                  {t.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#0D2B45] transition-colors">
                  Protection des Données & RGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-sm font-black text-[#0D2B45] mb-3.5 uppercase tracking-wider">Assistance & Recruteurs</h4>
            <ul className="space-y-2.5 font-semibold text-slate-600">
              <li>
                <a href="mailto:rhouadam0@gmail.com" className="hover:text-[#0D2B45] transition-colors flex items-center gap-1.5">
                  <span>Contact Support :</span>
                  <span className="text-[#1E5A6E] font-bold">rhouadam0@gmail.com</span>
                </a>
              </li>
              <li>
                <Link href="/salary-calculator" className="hover:text-[#0D2B45] transition-colors">
                  Simulateur Salaire (MAD)
                </Link>
              </li>
              <li>
                <Link href="/jobs?type=INTERNSHIP&pfe=true" className="hover:text-[#0D2B45] transition-colors">
                  Espace PFE & Écoles Maroc
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            © 2026 JobFinder AI. Tous droits réservés.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Portail développé pour les talents et le rayonnement du Maroc</span>
            <Heart className="h-3.5 w-3.5 text-red-500 inline fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
