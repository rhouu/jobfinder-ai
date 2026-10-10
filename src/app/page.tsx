import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSearch } from "@/components/HeroSearch";
import { JobCard } from "@/components/JobCard";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  ChevronRight,
  Code2,
  Database,
  Cloud,
  Shield,
  TrendingUp,
  Cpu,
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { JobStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type FeaturedJobItem = Awaited<ReturnType<typeof prisma.job.findMany<{
  include: { skills: true; company: true };
}>>>[number];

export default async function HomePage() {
  let featuredJobs: FeaturedJobItem[] = [];
  try {
    featuredJobs = await prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      take: 6,
      orderBy: { publicationDate: "desc" },
      include: { skills: true, company: true },
    });
  } catch (err) {
    console.warn("Database not reachable during page load, continuing with empty jobs:", err);
    featuredJobs = [];
  }

  const categories = [
    { name: "Informatique & Tech", icon: Code2, count: 28, tag: "Informatique & Tech" },
    { name: "Data & IA", icon: Database, count: 19, tag: "Data & Intelligence Artificielle" },
    { name: "Cloud & DevOps", icon: Cloud, count: 14, tag: "Cloud & DevOps" },
    { name: "Cybersécurité", icon: Shield, count: 11, tag: "Cybersécurité & Réseaux" },
    { name: "Banque & Fintech", icon: TrendingUp, count: 16, tag: "Banque & Fintech" },
    { name: "Ingénierie & Industrie", icon: Cpu, count: 22, tag: "Industrie & Ingénierie" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#0F172A] flex flex-col">
      <Navbar />

      {/* INSTITUTIONAL HERO SECTION - Exactly like Emploi-Public with Navy Banner & Crisp White Search */}
      <section className="relative bg-[#0D2B45] text-white pt-12 pb-24 md:pt-16 md:pb-32 px-4 sm:px-8 lg:px-14">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#081D30] via-[#0D2B45] to-[#1E5A6E] opacity-95 pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto text-center">
          {/* Breadcrumb / Category Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-200 mb-6 backdrop-blur-sm border border-white/15">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            <span>Portail National de Recrutement & des Stages au Maroc</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Les opportunités et entreprises qui recrutent
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal">
            Découvrez les offres d&apos;emploi et stages d&apos;excellence à Casablanca, Rabat, Marrakech, Tanger et à l&apos;international.
          </p>

          {/* Search Box */}
          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* METRICS BAR (Full width, white background, crisp icons) */}
      <section className="w-full bg-white border-b border-slate-200 py-6 px-4 sm:px-8 lg:px-14 shadow-sm">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#0D2B45]">100%</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Offres Réelles Vérifiées</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#1E5A6E]">500+</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Établissements Répertoriés</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#0D2B45]">Gemini IA</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Analyse CV & Matching</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-700">Maroc</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Couverture Nationale</div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="py-14 px-4 sm:px-8 lg:px-14 bg-[#F4F8FA]">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-[#1E5A6E] uppercase">
                Filières & Secteurs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D2B45] mt-1">
                Explorez par domaine de compétences
              </h2>
            </div>
            <Link
              href="/jobs"
              className="mt-3 md:mt-0 flex items-center gap-1.5 text-xs font-bold text-[#0D2B45] hover:text-[#1E5A6E] transition-colors"
            >
              <span>Voir toutes les filières</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/jobs?category=${encodeURIComponent(cat.tag)}`}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0D2B45] hover:shadow-md transition-all text-center group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F0F6] text-[#0D2B45] group-hover:bg-[#0D2B45] group-hover:text-white transition-all mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0D2B45] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 mt-1">
                    {cat.count} offres
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES LIST (Full width, Emploi-Public Cards) */}
      <section className="py-14 px-4 sm:px-8 lg:px-14 bg-white border-t border-b border-slate-200">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-black tracking-wider text-[#1E5A6E] uppercase">
                  Offres d&apos;emploi & Stages Récents
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D2B45] mt-1">
                Dernières annonces publiées
              </h2>
            </div>
            <Link
              href="/jobs"
              className="mt-3 md:mt-0 flex items-center gap-1.5 text-xs font-bold text-[#0D2B45] hover:text-[#1E5A6E] transition-colors"
            >
              <span>Accéder à toutes les offres</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job, idx) => (
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
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 lg:px-14 bg-[#F4F8FA]">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black tracking-wider text-[#1E5A6E] uppercase">
              Orientation & Recrutement
            </span>
            <h2 className="text-3xl font-black text-[#0D2B45] mt-2">
              Comment postuler sur JobFinder AI ?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal">
              Un processus transparent et sécurisé pour connecter les talents aux meilleurs recruteurs du Royaume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D2B45] text-white font-black text-xl mb-4 mx-auto shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0D2B45]">Recherche Ciblée</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Trouvez des postes par ville, domaine technique, contrat (Stage PFE, CDI) ou travail à distance.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E5A6E] text-white font-black text-xl mb-4 mx-auto shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0D2B45]">Matching CV & IA</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                L&apos;IA compare vos compétences réelles avec les exigences des recruteurs et vous propose un score objectif.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D2B45] text-white font-black text-xl mb-4 mx-auto shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0D2B45]">Candidature Directe</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Postulez directement sur les plateformes officielles ou contactez les entreprises grâce au module LeadFinder.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
