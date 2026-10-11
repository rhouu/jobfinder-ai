"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Bookmark,
  ShieldCheck,
  Coins,
  Clock,
  ArrowUpRight,
  Phone,
  Star,
  ExternalLink,
  Bell,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ApplicationModal } from "./ApplicationModal";

export interface JobCardProps {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogo?: string | null;
  companyPhone?: string | null;
  companyRating?: number | null;
  companyAddress?: string | null;
  googleMapsUrl?: string | null;
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
  publicationDate: string | Date;
  applicationMethod: "EXTERNAL" | "ASSISTED" | "AUTO_APPLY";
  officialApplyUrl?: string | null;
  isVerified?: boolean;
  sourceProvider?: string;
  skills?: Array<{ skill: string }> | string[];
  isSaved?: boolean;
  matchScore?: number | null;
  index?: number;
}

export function JobCard({
  id,
  title,
  slug,
  companyName,
  companyLogo,
  companyPhone,
  companyRating,
  companyAddress,
  googleMapsUrl,
  description,
  location,
  city,
  country,
  opportunityType,
  workArrangement,
  salaryMin,
  salaryMax,
  salaryCurrency,
  isPaidInternship,
  publicationDate,
  applicationMethod,
  officialApplyUrl,
  isVerified,
  sourceProvider,
  skills = [],
  isSaved = false,
  matchScore,
}: JobCardProps) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(isSaved);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/jobs/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.isSaved);
      } else if (res.status === 401) {
        window.location.href = "/auth/login";
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const formattedDate = new Date(publicationDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const skillList: string[] = skills.map((s) => (typeof s === "string" ? s : s.skill));

  const typeLabels: Record<string, string> = {
    INTERNSHIP: "Stage / PFE",
    FULL_TIME: "Emploi (CDI / CDD)",
    PART_TIME: "Temps partiel",
    FREELANCE: "Freelance",
    APPRENTICESHIP: "Alternance",
  };

  return (
    <>
      {/* Clean White Card styled exactly like Emploi-Public with horizontal banner & dual actions */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-[#1E5A6E]/50 transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Header row: Company badge + Actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-12 w-12 rounded-xl object-contain border border-slate-200 p-1 bg-white"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F0F6] text-[#0D2B45] font-black text-lg border border-[#1E5A6E]/20">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {companyName}
                  </span>
                  {isVerified && (
                    <span
                      title="Établissement & offre vérifiés"
                      className="inline-flex items-center text-[#1E5A6E]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                  {companyRating && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {companyRating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#1E5A6E]" />
                    {city || location || "Maroc"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Icon */}
            <button
              onClick={handleToggleSave}
              className={`rounded-xl border p-2 transition-all ${
                saved
                  ? "border-[#0D2B45] bg-[#0D2B45] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#0D2B45] hover:text-[#0D2B45]"
              }`}
              title={saved ? "Enregistré" : "Sauvegarder"}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Title */}
          <Link href={`/jobs/${id}`} className="mt-3.5 block group">
            <h3 className="text-base sm:text-lg font-black text-[#0D2B45] group-hover:text-[#1E5A6E] transition-colors leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Badges strip */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-lg bg-[#E6F0F6] text-[#0D2B45] px-2.5 py-1 border border-[#1E5A6E]/20">
              {typeLabels[opportunityType] || opportunityType}
            </span>
            <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1">
              {workArrangement === "REMOTE" ? "Télétravail (Remote)" : workArrangement === "HYBRID" ? "Hybride" : "Sur site"}
            </span>
            {isPaidInternship && (
              <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1">
                Stage Rémunéré
              </span>
            )}
            {salaryMin && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1">
                <Coins className="h-3.5 w-3.5 text-blue-700" />
                {salaryMin.toLocaleString()} {salaryMax ? `- ${salaryMax.toLocaleString()}` : ""} {salaryCurrency || "MAD"}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {description}
          </p>

          {/* Direct phone / WhatsApp / maps contacts */}
          {(companyPhone || googleMapsUrl) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
              {companyPhone && (
                <>
                  <a
                    href={`tel:${companyPhone}`}
                    className="flex items-center gap-1 text-slate-700 hover:text-[#0D2B45] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{companyPhone}</span>
                  </a>

                  {/* Direct WhatsApp button (Moroccan market recruitment standard) */}
                  <a
                    href={`https://wa.me/${companyPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Bonjour, je vous contacte suite à votre offre "${title}" publiée sur JobFinder AI. Mon profil m'intéresse beaucoup pour ce poste.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[11px] font-bold transition-colors"
                  >
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                    <span>WhatsApp RH</span>
                  </a>
                </>
              )}
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#1E5A6E] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Google Maps</span>
                </a>
              )}
            </div>
          )}

          {/* Skill tags */}
          {skillList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skillList.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                >
                  {skill}
                </span>
              ))}
              {skillList.length > 4 && (
                <span className="text-[11px] font-bold text-[#1E5A6E] self-center">
                  +{skillList.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions: Emploi-Public exact styling (Outline "Consulter" + Solid Navy "Créer une alerte / Postuler") */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-slate-500">
            Source : <strong className="text-slate-800">{sourceProvider || "Officiel"}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${id}`}
              className="rounded-xl border-2 border-[#0D2B45] bg-white px-3.5 py-1.5 text-xs font-black text-[#0D2B45] hover:bg-[#E6F0F6] transition-all flex items-center gap-1"
            >
              <span>Consulter l&apos;offre</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            {applicationMethod === "EXTERNAL" && officialApplyUrl ? (
              <a
                href={officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2 text-xs font-black text-white shadow-sm transition-all"
              >
                <span>Postuler</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2 text-xs font-black text-white shadow-sm transition-all"
              >
                <span>Postuler avec IA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Application modal */}
      {isModalOpen && (
        <ApplicationModal
          job={{
            id,
            title,
            companyName,
            description,
            applicationMethod,
            officialApplyUrl,
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
