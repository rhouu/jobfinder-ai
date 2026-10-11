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
  GraduationCap,
  Rocket,
} from "lucide-react";
import { JobStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type FeaturedJobItem = Awaited<ReturnType<typeof prisma.job.findMany<{
  include: { skills: true; company: true };
}>>>[number];

export default async function HomePage() {
  let featuredJobs: FeaturedJobItem[] = [];
  let totalActiveJobs = 0;
  let totalCompanies = 0;
  let categoryCounts: Record<string, number> = {};

  try {
    const [jobs, jobCount, compCount, catGroups] = await Promise.all([
      prisma.job.findMany({
        where: { status: JobStatus.ACTIVE },
        take: 6,
        orderBy: { publicationDate: "desc" },
        include: { skills: true, company: true },
      }),
      prisma.job.count({ where: { status: JobStatus.ACTIVE } }),
      prisma.company.count(),
      prisma.job.groupBy({
        by: ["category"],
        where: { status: JobStatus.ACTIVE },
        _count: { _all: true },
      }),
    ]);

    featuredJobs = jobs;
    totalActiveJobs = jobCount;
    totalCompanies = compCount;
    for (const g of catGroups) {
      categoryCounts[g.category] = g._count._all;
    }
  } catch (err) {
    console.warn("Database not reachable during page load, continuing with empty jobs:", err);
    featuredJobs = [];
  }

  const categories = [
    { name: "Informatique & Tech", icon: Code2, count: categoryCounts["Informatique & Tech"] ?? 0, tag: "Informatique & Tech" },
    { name: "Data & IA", icon: Database, count: categoryCounts["Data & Intelligence Artificielle"] ?? 0, tag: "Data & Intelligence Artificielle" },
    { name: "Cloud & DevOps", icon: Cloud, count: categoryCounts["Cloud & DevOps"] ?? 0, tag: "Cloud & DevOps" },
    { name: "Cybersécurité", icon: Shield, count: categoryCounts["Cybersécurité & Réseaux"] ?? 0, tag: "Cybersécurité & Réseaux" },
    { name: "Banque & Fintech", icon: TrendingUp, count: categoryCounts["Banque & Fintech"] ?? 0, tag: "Banque & Fintech" },
    { name: "Ingénierie & Industrie", icon: Cpu, count: categoryCounts["Industrie & Ingénierie"] ?? 0, tag: "Industrie & Ingénierie" },
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
            <div className="text-3xl font-black text-[#0D2B45]">{totalActiveJobs > 0 ? totalActiveJobs : "Actif"}</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Offres Actives Réelles</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#1E5A6E]">{totalCompanies > 0 ? totalCompanies : "500+"}</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Établissements Répertoriés</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#0D2B45]">Audit ATS</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Score CV & Diagnostic</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-700">100% Maroc</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase">Couverture Nationale</div>
          </div>
        </div>
      </section>

      {/* ESPACE ÉTUDIANTS, LAURÉATS & PFE MAROC (Idea 2) */}
      <section className="py-10 px-4 sm:px-8 lg:px-14 bg-gradient-to-r from-[#0D2B45] via-[#1E5A6E] to-[#0D2B45] text-white">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/20 border border-cyan-300/30 px-3.5 py-1 text-xs font-bold text-cyan-200">
              <GraduationCap className="h-4 w-4 text-cyan-300" />
              <span>Spécial Étudiants, Lauréats & Écoles du Maroc</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Préparez votre PFE & Premier Emploi
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
              Filtrez instantanément les stages PFE 2026, opportunités de pré-embauche et postes juniors adaptés aux écoles marocaines (OFPPT, ENSIAS, EMSI, FST, ENCG...).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
            <Link
              href="/jobs?type=INTERNSHIP&pfe=true"
              className="rounded-xl bg-white text-[#0D2B45] hover:bg-slate-100 px-5 py-3 text-xs sm:text-sm font-black shadow-lg transition-all flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4 text-[#1E5A6E]" />
              <span>Stages PFE 2026</span>
            </Link>
            <Link
              href="/jobs?type=INTERNSHIP&paidOnly=true"
              className="rounded-xl bg-[#0D2B45]/60 hover:bg-[#0D2B45] border border-cyan-300/40 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2"
            >
              <Rocket className="h-4 w-4 text-cyan-300" />
              <span>Stages Rémunérés</span>
            </Link>
            <Link
              href="/jobs?experience=0"
              className="rounded-xl bg-[#0D2B45]/60 hover:bg-[#0D2B45] border border-cyan-300/40 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2"
            >
              <span>Premier Emploi (0-2 ans)</span>
            </Link>
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
                Postulez en un clic sur les plateformes officielles ou contactez directement les recruteurs par WhatsApp et Téléphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
