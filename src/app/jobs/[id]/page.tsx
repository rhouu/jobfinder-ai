import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobDetailActions } from "@/components/JobDetailActions";
import { getJobById } from "@/lib/services/job-service";
import { getSession } from "@/lib/auth";
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  Coins,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const job = await getJobById(id, session?.userId);

  if (!job) {
    notFound();
  }

  const formattedDate = new Date(job.publicationDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-[#1E5A6E] hover:brightness-125 font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux offres</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#FFFFFF] px-2.5 py-1 text-[11px] text-slate-600 border border-[#D1E3EC]">
              Réf : {job.externalId || job.id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D1E3EC] bg-[#F4F8FA] overflow-hidden shadow-lg">
                {job.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-[#1E5A6E]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  {job.company?.slug ? (
                    <Link
                      href={`/companies/${job.company.slug}`}
                      className="text-sm font-semibold text-[#1E5A6E] hover:underline"
                    >
                      {job.companyName}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">
                      {job.companyName}
                    </span>
                  )}

                  {job.isVerified && (
                    <span
                      title="Source et employeur vérifiés par JobFinder AI"
                      className="inline-flex items-center gap-1 rounded-full bg-[#0D2B45]/25 border border-[#1E5A6E]/30 px-2 py-0.5 text-[10px] font-semibold text-[#1E5A6E]"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Vérifié
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2B45] mt-1 leading-snug">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#1E5A6E]" />
                    <span>{job.city || job.location}, {job.country}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Publié le {formattedDate}</span>
                  </div>
                  {formattedDeadline && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-[#1E5A6E] font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#1E5A6E]" />
                        <span>Date limite : {formattedDeadline}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* AI Match Score Pill if candidate has CV analyzed */}
            {job.matchAnalysis && (
              <div className="rounded-2xl border border-[#1E5A6E]/35 bg-[#0D2B45]/20 p-4 text-center shrink-0">
                <span className="text-[11px] font-bold text-[#1E5A6E] uppercase tracking-wider block">
                  Score de Match CV
                </span>
                <span className="text-3xl font-black text-[#1E5A6E]">
                  {job.matchAnalysis.overallScore}%
                </span>
                <p className="text-[10px] text-[#1E5A6E]/80 mt-0.5">
                  Calculé d&apos;après votre CV actif
                </p>
              </div>
            )}
          </div>

          {/* Metadata Badges Strip */}
          <div className="mt-6 pt-6 border-t border-[#D1E3EC] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-[#0D2B45]/50 bg-[#0D2B45]/20 px-3 py-1 font-semibold text-[#1E5A6E]">
                {job.opportunityType === "INTERNSHIP"
                  ? "Stage & PFE"
                  : job.opportunityType === "APPRENTICESHIP"
                  ? "Alternance"
                  : "Emploi"}
              </span>

              <span className="rounded-lg border border-[#D1E3EC] bg-[#F4F8FA]/70 px-3 py-1 font-semibold text-slate-600">
                {job.workArrangement === "REMOTE"
                  ? "Télétravail complet (Remote)"
                  : job.workArrangement === "HYBRID"
                  ? "Hybride"
                  : "Sur site"}
              </span>

              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center gap-1.5 rounded-lg border border-[#1E5A6E]/30 bg-[#1E5A6E]/10 px-3 py-1 font-bold text-[#1E5A6E]">
                  <Coins className="h-3.5 w-3.5" />
                  <span>
                    {job.salaryMin ? `${job.salaryMin.toLocaleString()}` : ""}
                    {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : ""} {job.salaryCurrency || "MAD"}
                  </span>
                </span>
              )}

              {job.isPaidInternship && !job.salaryMin && (
                <span className="rounded-lg border border-[#1E5A6E]/30 bg-[#1E5A6E]/10 px-3 py-1 font-bold text-[#1E5A6E]">
                  Stage Rémunéré
                </span>
              )}

              <span className="rounded-lg border border-[#D1E3EC] bg-[#F4F8FA]/70 px-3 py-1 text-slate-600">
                Secteur : {job.category}
              </span>
            </div>

            {/* Primary Action Button */}
            <JobDetailActions
              job={{
                id: job.id,
                title: job.title,
                companyName: job.companyName,
                description: job.description,
                applicationMethod: job.applicationMethod,
                officialApplyUrl: job.officialApplyUrl,
              }}
            />
          </div>
        </div>

        {/* Content Columns: Description + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description & Requirements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0D2B45]">Descriptif de l&apos;opportunité</h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-3">
                <h2 className="text-base font-bold text-[#0D2B45]">Missions & Responsabilités</h2>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.responsibilities.map((resp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#1E5A6E] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-3">
                <h2 className="text-base font-bold text-[#0D2B45]">Profil recherché & Exigences</h2>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.qualifications.map((qual: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1E5A6E] shrink-0 mt-2" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-3">
              <h2 className="text-base font-bold text-[#0D2B45]">Compétences techniques requises</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s: { skill: string }) => (
                  <span
                    key={s.skill}
                    className="rounded-lg border border-[#D1E3EC] bg-[#F4F8FA] px-3 py-1.5 text-xs font-semibold text-[#1E5A6E]"
                  >
                    {s.skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Company Info, Source Transparency */}
          <div className="space-y-6">
            {/* Company Card */}
            {job.company && (
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  À propos de l&apos;entreprise
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F8FA] border border-[#D1E3EC] overflow-hidden">
                    {job.company.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-[#1E5A6E]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0D2B45]">{job.company.name}</h4>
                    <p className="text-xs text-slate-500">{job.company.industry || "Entreprise"}</p>
                  </div>
                </div>

                {job.company.rating && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500">
                    <span>★ {job.company.rating.toFixed(1)} / 5</span>
                    <span className="text-[10px] text-amber-500/80 font-normal">Avis Google Maps</span>
                  </div>
                )}

                {job.company.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {job.company.description}
                  </p>
                )}

                <div className="space-y-1.5 pt-2 border-t border-[#D1E3EC] text-xs">
                  {job.company.address && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-[#1E5A6E] shrink-0 mt-0.5" />
                      <span>{job.company.address}</span>
                    </div>
                  )}

                  {job.company.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-[#1E5A6E] font-semibold">📞 Téléphone :</span>
                      <a href={`tel:${job.company.phone}`} className="text-[#1E5A6E] font-bold hover:underline">
                        {job.company.phone}
                      </a>
                    </div>
                  )}

                  {job.company.googleMapsUrl && (
                    <div className="pt-1">
                      <a
                        href={job.company.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E5A6E] hover:brightness-125"
                      >
                        <span>Voir sur Google Maps</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {job.company.website && (
                    <div className="pt-1">
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0D2B45]"
                      >
                        <span>Visiter le site web officiel</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source & Freshness Transparency */}
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-5 space-y-3 text-xs">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Traçabilité & Vérification
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between pb-1.5 border-b border-[#D1E3EC]">
                  <span className="text-slate-500">Fournisseur de flux :</span>
                  <span className="font-semibold text-[#0D2B45]">{job.sourceProvider}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D1E3EC]">
                  <span className="text-slate-500">Dernière vérification :</span>
                  <span>{new Date(job.lastCheckedAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut de l&apos;offre :</span>
                  <span className="text-[#1E5A6E] font-semibold">Active & Contrôlée</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                🛡️ JobFinder AI protège les candidats en vérifiant l&apos;authenticité des recruteurs et en rejetant toute offre sans contact officiel avéré.
              </div>
            </div>
          </div>
        </div>

        {/* Similar Opportunities */}
        {job.similarJobs && job.similarJobs.length > 0 && (
          <div className="pt-8 border-t border-[#D1E3EC] space-y-4">
            <h2 className="text-xl font-bold text-[#0D2B45]">Opportunités similaires recommandées</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {job.similarJobs.map((simJob: any) => (
                <JobCard
                  key={simJob.id}
                  id={simJob.id}
                  title={simJob.title}
                  slug={simJob.slug}
                  companyName={simJob.companyName}
                  companyLogo={simJob.companyLogo}
                  description={simJob.description}
                  location={simJob.location}
                  city={simJob.city}
                  country={simJob.country}
                  category={simJob.category}
                  opportunityType={simJob.opportunityType}
                  workArrangement={simJob.workArrangement}
                  salaryMin={simJob.salaryMin}
                  salaryMax={simJob.salaryMax}
                  salaryCurrency={simJob.salaryCurrency}
                  isPaidInternship={simJob.isPaidInternship}
                  publicationDate={simJob.publicationDate}
                  applicationMethod={simJob.applicationMethod}
                  officialApplyUrl={simJob.officialApplyUrl}
                  isVerified={simJob.isVerified}
                  sourceProvider={simJob.sourceProvider}
                  skills={simJob.skills}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
