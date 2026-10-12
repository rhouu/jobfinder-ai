"use client";

import React, { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobAlertSubscriptionCard } from "@/components/JobAlertSubscriptionCard";
import { useI18n } from "@/lib/i18n";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogo?: string | null;
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    isVerified?: boolean;
    phone?: string | null;
    rating?: number | null;
    address?: string | null;
    googleMapsUrl?: string | null;
  } | null;
  description: string;
  location: string;
  city: string;
  country: string;
  category: string;
  opportunityType: string;
  workArrangement: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  isPaidInternship?: boolean | null;
  publicationDate: string;
  applicationMethod: "EXTERNAL" | "ASSISTED" | "AUTO_APPLY";
  officialApplyUrl?: string | null;
  isVerified?: boolean;
  sourceProvider?: string;
  skills: Array<{ skill: string }>;
  isSaved?: boolean;
  matchScore?: number | null;
}

function JobsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [isPending, startTransition] = useTransition();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestedReason, setSuggestedReason] = useState<string | null>(null);

  // Filters state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [arrangement, setArrangement] = useState(searchParams.get("arrangement") || "");
  const [paidOnly, setPaidOnly] = useState(searchParams.get("paidOnly") === "true");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verifiedOnly") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const localSaved = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
        setSavedJobIds(localSaved);
      } catch {}

      const handleUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<string[]>;
        if (customEvent.detail) {
          setSavedJobIds(customEvent.detail);
        } else {
          try {
            const fresh = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
            setSavedJobIds(fresh);
          } catch {}
        }
      };

      window.addEventListener("saved_jobs_updated", handleUpdate);
      return () => window.removeEventListener("saved_jobs_updated", handleUpdate);
    }
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setLocation(searchParams.get("location") || "");
    setCategory(searchParams.get("category") || "");
    setType(searchParams.get("type") || "");
    setArrangement(searchParams.get("arrangement") || "");
    setPaidOnly(searchParams.get("paidOnly") === "true");
    setVerifiedOnly(searchParams.get("verifiedOnly") === "true");
    setSort(searchParams.get("sort") || "relevance");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const displayedJobs = favoritesOnly
    ? jobs.filter((j) => savedJobIds.includes(j.id))
    : jobs;

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

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (arrangement) params.set("arrangement", arrangement);
    if (paidOnly) params.set("paidOnly", "true");
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", "12");
    if (forceRefresh) params.set("refresh", "true");

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setSuggestedReason(data.suggestedReason || null);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [query, location, category, type, arrangement, paidOnly, verifiedOnly, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (arrangement) params.set("arrangement", arrangement);
    if (paidOnly) params.set("paidOnly", "true");
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (sort) params.set("sort", sort);

    startTransition(() => {
      router.push(`/jobs?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setQuery("");
    setLocation("");
    setCategory("");
    setType("");
    setArrangement("");
    setPaidOnly(false);
    setVerifiedOnly(false);
    setSort("relevance");
    setPage(1);
    startTransition(() => {
      router.push("/jobs");
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <Navbar />

      {/* Top Banner (Deep Midnight #0A192F) */}
      <div className="bg-gradient-to-b from-[#060D17] via-[#0A192F] to-[#0F2744] text-white py-10 px-4 sm:px-8 lg:px-14">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {type === "INTERNSHIP"
                  ? "🎓 Stages & PFE 2026 au Maroc"
                  : type === "JOB"
                  ? "💼 Offres d'Emploi au Maroc"
                  : "Résultats de recherche"}
              </h1>
              <p className="text-sm text-slate-200 mt-1 font-normal">
                {type === "INTERNSHIP"
                  ? `${total} stage(s) PFE, pré-embauche et immersion répertoriés`
                  : type === "JOB"
                  ? `${total} offre(s) d'emploi en CDI / CDD répertoriées`
                  : `${total} offre(s) et opportunité(s) réelles répertoriées au Maroc`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchJobs(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-300 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Synchronisation..." : "Actualiser"}</span>
              </button>

              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="lg:hidden flex items-center gap-2 rounded-xl bg-white text-slate-800 px-4 py-2 text-xs font-bold shadow"
              >
                <Filter className="h-4 w-4 text-blue-600" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          {/* Search Box inside Banner */}
          <form
            onSubmit={handleApplyFilters}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200"
          >
            <div className="sm:col-span-5 flex items-center bg-[#F8FAFC] rounded-xl px-3.5 py-2.5 border border-slate-300 focus-within:border-blue-600">
              <Search className="h-4 w-4 text-blue-600 shrink-0 mr-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mots-clés, intitulé de poste..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-semibold"
              />
            </div>

            <div className="sm:col-span-4 flex items-center bg-[#F8FAFC] rounded-xl px-3.5 py-2.5 border border-slate-300 focus-within:border-blue-600">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ville ou télétravail..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-semibold"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 px-4 text-xs sm:text-sm font-black text-white shadow-md shadow-blue-500/25 transition-all text-center cursor-pointer"
              >
                Rechercher
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all cursor-pointer"
                title="Réinitialiser"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Filter Badges (PFE, Étudiants, Premier Emploi, Rémunéré) */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
            <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-cyan-300" />
              Accès Rapide :
            </span>
            <button
              onClick={() => {
                try {
                  const localSaved = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
                  setSavedJobIds(localSaved);
                } catch {}
                setFavoritesOnly(!favoritesOnly);
              }}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                favoritesOnly
                  ? "bg-rose-500 text-white border-rose-400 shadow-md font-bold"
                  : "bg-white/10 hover:bg-white/20 border-white/20 text-rose-200"
              }`}
            >
              ❤️ Mes Favoris ({savedJobIds.length})
            </button>
            <button
              onClick={() => {
                setType("INTERNSHIP");
                setQuery("PFE");
                fetchJobs();
              }}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white transition-all"
            >
              🎓 Stages PFE 2026
            </button>
            <button
              onClick={() => {
                setType("INTERNSHIP");
                setPaidOnly(true);
                fetchJobs();
              }}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-cyan-200 transition-all"
            >
              💰 Stages Rémunérés
            </button>
            <button
              onClick={() => {
                setType("JOB");
                setQuery("Junior");
                fetchJobs();
              }}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white transition-all"
            >
              💼 Premier Emploi / Juniors
            </button>
            <button
              onClick={() => {
                setArrangement("REMOTE");
                fetchJobs();
              }}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white transition-all"
            >
              🌐 Télétravail (100% Remote)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar Filters + Job Results (Crisp Emploi-Public Theme) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (Emploi-Public Clean White Style) */}
          <aside className={`lg:col-span-4 lg:block ${showMobileFilter ? "block" : "hidden"} space-y-6`}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  FILTRES
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Type d'opportunité Radio List like screenshot */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">
                  Type d&apos;opportunité
                </label>
                <div className="space-y-2">
                  {[
                    { val: "", label: "Tout afficher" },
                    { val: "FULL_TIME", label: "Emplois (CDI / CDD)" },
                    { val: "INTERNSHIP", label: "Stages & PFE" },
                    { val: "APPRENTICESHIP", label: "Alternance" },
                    { val: "FREELANCE", label: "Freelance" },
                  ].map((item) => (
                    <label key={item.val} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="opportunityType"
                        checked={type === item.val}
                        onChange={() => {
                          setType(item.val);
                          setPage(1);
                        }}
                        className="text-blue-600 focus:ring-blue-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mode de travail */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">
                  Mode de travail
                </label>
                <div className="space-y-2">
                  {[
                    { val: "", label: "Tous" },
                    { val: "REMOTE", label: "Télétravail (Remote)" },
                    { val: "HYBRID", label: "Hybride" },
                    { val: "ON_SITE", label: "Sur site" },
                  ].map((item) => (
                    <label key={item.val} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="workArrangement"
                        checked={arrangement === item.val}
                        onChange={() => {
                          setArrangement(item.val);
                          setPage(1);
                        }}
                        className="text-blue-600 focus:ring-blue-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Secteur Professionnel */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Secteur professionnel
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paidOnly}
                    onChange={(e) => {
                      setPaidOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Stage rémunéré uniquement</span>
                </label>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-emerald-700">
                  <span>🛡️ 100% des offres sont contrôlées</span>
                </div>
              </div>
            </div>

            {/* Email / WhatsApp Job Alerts */}
            <JobAlertSubscriptionCard />
          </aside>

          {/* Job List Container */}
          <main className="lg:col-span-8 space-y-5">
            {/* Sorting bar */}
            <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <span className="font-bold text-slate-700">
                <strong>{favoritesOnly ? displayedJobs.length : total}</strong> {favoritesOnly ? "offres sauvegardées" : "offres trouvées"}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Trier par :</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="recent">Plus récentes</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"
                  />
                ))}
              </div>
            ) : displayedJobs.length === 0 ? (
              <div className="text-center py-20 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                {favoritesOnly ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">❤️</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Aucun favori enregistré</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Cliquez sur l&apos;icône ❤️ sur n&apos;importe quelle offre d&apos;emploi ou de stage pour la retrouver instantanément ici.
                    </p>
                    <button
                      onClick={() => setFavoritesOnly(false)}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Explorer toutes les offres
                    </button>
                  </>
                ) : (
                  <>
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">Aucune offre ne correspond</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Modifiez vos critères de recherche ou cliquez sur &laquo; Actualiser &raquo; pour synchroniser les dernières offres disponibles.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Réinitialiser les filtres
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedJobs.map((job, idx) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    slug={job.slug}
                    companyName={job.companyName}
                    companyLogo={job.company?.logoUrl}
                    companyPhone={job.company?.phone}
                    companyRating={job.company?.rating}
                    companyAddress={job.company?.address}
                    googleMapsUrl={job.company?.googleMapsUrl}
                    description={job.description}
                    location={job.location}
                    city={job.city}
                    country={job.country}
                    category={job.category}
                    opportunityType={job.opportunityType}
                    workArrangement={job.workArrangement}
                    salaryMin={job.salaryMin}
                    salaryMax={job.salaryMax}
                    salaryCurrency={job.salaryCurrency}
                    isPaidInternship={job.isPaidInternship}
                    publicationDate={job.publicationDate}
                    applicationMethod={job.applicationMethod}
                    officialApplyUrl={job.officialApplyUrl}
                    isVerified={job.isVerified}
                    sourceProvider={job.sourceProvider}
                    skills={job.skills}
                    isSaved={job.isSaved}
                    matchScore={job.matchScore}
                    index={idx}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Précédent</span>
                </button>

                <span className="px-4 text-xs font-black text-slate-800">
                  Page {page} sur {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-800 font-bold text-sm">
          Chargement des opportunités...
        </div>
      }
    >
      <JobsSearchContent />
    </Suspense>
  );
}
