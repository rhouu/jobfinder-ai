import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  Star,
  Phone,
  ExternalLink,
} from "lucide-react";
import { JobStatus } from "@prisma/client";


export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { status: JobStatus.ACTIVE },
        include: { skills: true },
        orderBy: { publicationDate: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col selection:bg-[#0D2B45] selection:text-[#0D2B45]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E5A6E] hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux opportunités</span>
        </Link>

        {/* Company Header */}
        <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D1E3EC] bg-[#F4F8FA] overflow-hidden shadow-xl">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-[#1E5A6E]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2B45]">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span
                      title="Entreprise certifiée"
                      className="inline-flex items-center gap-1 rounded-full bg-[#0D2B45]/20 border border-[#0D2B45]/40 px-2.5 py-0.5 text-xs font-semibold text-[#1E5A6E]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1E5A6E]" />
                      Vérifié
                    </span>
                  )}
                  {typeof company.rating === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F8FA] border border-[#D1E3EC] px-2.5 py-0.5 text-xs font-bold text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      {company.rating.toFixed(1)} / 5
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#1E5A6E]/80 mt-1">
                  {company.industry || "Entreprise Innovante"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-800/80 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#1E5A6E]" />
                    <span>{company.address || company.location || company.city || "Maroc"}</span>
                  </div>

                  {company.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#1E5A6E]" />
                      <a href={`tel:${company.phone}`} className="hover:underline text-slate-800">
                        {company.phone}
                      </a>
                    </div>
                  )}

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1E5A6E] hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Site web officiel</span>
                    </a>
                  )}

                  {company.googleMapsUrl && (
                    <a
                      href={company.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1E5A6E] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Google Maps</span>
                    </a>
                  )}

                  {company.contactEmail && (
                    <div className="flex items-center gap-1 text-slate-800/60">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{company.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D1E3EC] bg-[#F4F8FA] px-4 py-3 text-center shrink-0">
              <span className="text-[11px] font-bold text-[#1E5A6E]/80 uppercase tracking-wider block">
                Postes Actifs
              </span>
              <span className="text-2xl font-black text-[#1E5A6E]">
                {company.jobs.length}
              </span>
            </div>
          </div>

          {company.description && (
            <div className="mt-6 pt-6 border-t border-[#D1E3EC] text-xs sm:text-sm text-slate-800/80 leading-relaxed">
              {company.description}
            </div>
          )}
        </div>

        {/* Company Active Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#1E5A6E]" />
            <h2 className="text-xl font-bold text-[#0D2B45]">
              Opportunités publiées par {company.name}
            </h2>
          </div>

          {company.jobs.length === 0 ? (
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/50 p-8 text-center text-xs text-slate-800/60">
              Aucun poste ouvert pour le moment chez {company.name}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  slug={job.slug}
                  companyName={company.name}
                  companyLogo={company.logoUrl}
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
                  isVerified={company.isVerified}
                  sourceProvider={job.sourceProvider}
                  skills={job.skills}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
