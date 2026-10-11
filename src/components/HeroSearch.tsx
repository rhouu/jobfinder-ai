"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HeroSearch() {
  const router = useRouter();
  const { t } = useI18n();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    "Informatique & Tech",
    "Data & Intelligence Artificielle",
    "Cloud & DevOps",
    "Cybersécurité & Réseaux",
    "Banque & Fintech",
    "Industrie & Ingénierie",
    "Marketing & Digital",
    "Design & UI/UX",
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    if (category) params.set("category", category);
    if (type) params.set("type", type);

    setTimeout(() => {
      router.push(`/jobs?${params.toString()}`);
    }, 150);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Clean White Card with crisp shadow and border */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Input */}
          <div className="md:col-span-5 flex items-center bg-[#F8FAFC] rounded-xl px-4 py-3.5 border border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15 transition-all">
            <Search className="h-5 w-5 text-blue-600 shrink-0 mr-3" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Poste, domaine, mot-clé (ex: Développeur, Ingénieur)..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Location Input */}
          <div className="md:col-span-4 flex items-center bg-[#F8FAFC] rounded-xl px-4 py-3.5 border border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15 transition-all">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0 mr-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville (Casablanca, Rabat, Marrakech, Tanger...)"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Action Button: Vibrant Royal Blue */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3.5 px-6 text-sm sm:text-base font-black text-white shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Rechercher</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick select filters line */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full flex-nowrap sm:flex-wrap scrollbar-none">
            <span className="font-bold text-slate-500 shrink-0">Suggestions rapides :</span>
            {[
              "Stages PFE Casablanca",
              "Ingénieur Génie Civil",
              "Informatique & Tech",
              "Télétravail (Remote)",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setKeyword(q);
                  router.push(`/jobs?q=${encodeURIComponent(q)}`);
                }}
                className="shrink-0 rounded-lg bg-slate-100 hover:bg-[#E6F0F6] hover:text-[#0D2B45] px-2.5 py-1 text-slate-700 font-semibold transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
