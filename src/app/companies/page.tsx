"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Building2,
  Search,
  MapPin,
  Globe,
  Phone,
  Star,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Compass,
} from "lucide-react";

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  rating?: number;
  googleMapsUrl?: string;
  isVerified: boolean;
  jobsCount: number;
}

const MOROCCO_CITIES = ["Tous", "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tous");
  const [placesLoading, setPlacesLoading] = useState(false);

  const fetchCompanies = useCallback(async (isPlacesSearch = false) => {
    if (isPlacesSearch) setPlacesLoading(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedCity !== "Tous") params.set("city", selectedCity);
      if (isPlacesSearch) params.set("places", "true");

      const res = await fetch(`/api/companies?${params.toString()}`);
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
      setPlacesLoading(false);
    }
  }, [searchQuery, selectedCity]);

  useEffect(() => {
    fetchCompanies(false);
  }, [fetchCompanies]);

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col selection:bg-[#0D2B45] selection:text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-[#D1E3EC] bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF]/80 to-[#F4F8FA] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#0D2B45]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0D2B45]/50 bg-[#0D2B45]/20 px-3 py-1 text-xs font-semibold text-[#1E5A6E]">
              <Compass className="h-3.5 w-3.5" />
              <span>Annuaire vérifié Google Places & Recruteurs Directs</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Découvrez les Entreprises qui recrutent
            </h1>
            <p className="text-sm sm:text-base text-[#1E5A6E]/80 leading-relaxed">
              Explorez les acteurs technologiques, industriels et innovants au Maroc et à l&apos;international.
              Informations vérifiées en temps réel via l&apos;API Google Places avec coordonnées, notes et opportunités ouvertes.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/90 p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E5A6E]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCompanies(false)}
                placeholder="Rechercher par nom d'entreprise ou secteur (ex: OCP, Capgemini, IA, Cloud...)"
                className="w-full rounded-xl border border-[#D1E3EC] bg-[#F4F8FA] pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-800/40 focus:outline-none focus:border-[#1E5A6E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => fetchCompanies(false)}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] text-xs font-bold text-slate-900 shadow-lg shadow-[#0D2B45]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Filtrer
              </button>

              <button
                onClick={() => fetchCompanies(true)}
                disabled={placesLoading}
                title="Explorer et importer des entreprises vérifiées en direct via l'API Google Places"
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#1E5A6E]/40 bg-[#0D2B45]/20 text-xs font-bold text-[#1E5A6E] hover:bg-[#0D2B45]/40 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Compass className={`h-4 w-4 ${placesLoading ? "animate-spin" : ""}`} />
                <span>{placesLoading ? "Exploration..." : "Live Google Places"}</span>
              </button>
            </div>
          </div>

          {/* City Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
            <span className="text-slate-800/60 shrink-0 font-medium mr-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#1E5A6E]" /> Ville :
            </span>
            {MOROCCO_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
                  selectedCity === city
                    ? "bg-[#0D2B45] text-slate-900 shadow"
                    : "bg-[#F4F8FA] text-slate-800/70 hover:text-slate-900 border border-[#D1E3EC]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/50 animate-pulse"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/60 p-12 text-center space-y-4">
            <Building2 className="h-12 w-12 text-[#1E5A6E]/50 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Aucune entreprise trouvée</h3>
            <p className="text-xs text-slate-800/60 max-w-md mx-auto">
              Aucun résultat pour ces critères. Cliquez sur &quot;Live Google Places&quot; pour explorer directement l&apos;écosystème local.
            </p>
            <button
              onClick={() => fetchCompanies(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] text-xs font-semibold text-slate-900"
            >
              <Compass className="h-4 w-4" />
              <span>Lancer l&apos;exploration Google Places</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="group flex flex-col justify-between rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 shadow-xl hover:border-[#1E5A6E]/60 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D1E3EC] bg-[#F4F8FA] overflow-hidden shadow">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-[#1E5A6E]" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {company.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0D2B45]/20 border border-[#0D2B45]/40 px-2 py-0.5 text-[10px] font-semibold text-[#1E5A6E]">
                          <ShieldCheck className="h-3 w-3 text-[#1E5A6E]" />
                          Vérifié
                        </span>
                      )}
                      {typeof company.rating === "number" && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-[#F4F8FA] border border-[#D1E3EC] px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                          <span>{company.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Industry */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-[#1E5A6E] transition-colors line-clamp-1">
                      {company.name}
                    </h2>
                    <p className="text-xs text-[#1E5A6E]/80 mt-0.5 line-clamp-1">
                      {company.industry || "Technologie & Services"}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-slate-800/70 pt-2 border-t border-[#D1E3EC]">
                    {company.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#1E5A6E] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-[11px]">{company.address}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#1E5A6E] shrink-0" />
                        <span>{company.city || "Maroc"}</span>
                      </div>
                    )}

                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[#1E5A6E] shrink-0" />
                        <a
                          href={`tel:${company.phone}`}
                          className="hover:text-slate-900 transition-colors text-[11px]"
                        >
                          {company.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t border-[#D1E3EC] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-800/80">
                    <Briefcase className="h-3.5 w-3.5 text-[#1E5A6E]" />
                    <span className="font-semibold text-slate-900">{company.jobsCount}</span>
                    <span className="text-[11px] text-slate-800/60">offre(s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.googleMapsUrl && (
                      <a
                        href={company.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir sur Google Maps"
                        className="p-2 rounded-xl border border-[#D1E3EC] bg-[#F4F8FA] text-[#1E5A6E] hover:text-slate-900 hover:border-[#1E5A6E] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Site web officiel"
                        className="p-2 rounded-xl border border-[#D1E3EC] bg-[#F4F8FA] text-[#1E5A6E] hover:text-slate-900 hover:border-[#1E5A6E] transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <Link
                      href={`/companies/${company.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] text-[11px] font-bold text-slate-900 shadow hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span>Voir profil</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
