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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              <span>Annuaire Officiel & Vérifié des Recruteurs au Maroc</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Découvrez les Entreprises qui recrutent
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Explorez les acteurs technologiques, industriels et innovants au Maroc.
              Informations vérifiées avec coordonnées téléphoniques, adresses certifiées et opportunités de recrutement ouvertes.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCompanies(false)}
                placeholder="Rechercher par nom d'entreprise ou secteur (ex: OCP, Capgemini, IA, Cloud...)"
                className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => fetchCompanies(false)}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                Filtrer
              </button>

              <button
                onClick={() => fetchCompanies(true)}
                disabled={placesLoading}
                title="Actualiser et explorer les entreprises du tissu économique marocain"
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Compass className={`h-4 w-4 ${placesLoading ? "animate-spin text-blue-600" : ""}`} />
                <span>{placesLoading ? "Actualisation..." : "Actualiser l'Annuaire"}</span>
              </button>
            </div>
          </div>

          {/* City Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
            <span className="text-slate-500 shrink-0 font-bold mr-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-600" /> Ville :
            </span>
            {MOROCCO_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs ${
                  selectedCity === city
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent"
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
                className="h-64 rounded-2xl border border-slate-200 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Aucune entreprise trouvée</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Aucun résultat pour ces critères. Cliquez sur &quot;Actualiser l&apos;annuaire&quot; pour charger les établissements disponibles.
            </p>
            <button
              onClick={() => fetchCompanies(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Actualiser les entreprises</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500/60 transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white overflow-hidden p-1 shadow-sm">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-700 font-black text-lg">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {company.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          Vérifié
                        </span>
                      )}
                      {typeof company.rating === "number" && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{company.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Industry */}
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {company.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                      {company.industry || "Technologie & Services"}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {company.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-[11px] font-medium">{company.address}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{company.city || "Maroc"}</span>
                      </div>
                    )}

                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <a
                          href={`tel:${company.phone}`}
                          className="hover:text-blue-600 transition-colors text-[11px] font-medium"
                        >
                          {company.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-slate-900">{company.jobsCount}</span>
                    <span className="text-[11px] text-slate-500">offre(s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.googleMapsUrl && (
                      <a
                        href={company.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir sur Google Maps"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-colors"
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
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <Link
                      href={`/companies/${company.slug}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer"
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
