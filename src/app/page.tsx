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
  ArrowRight,
} from "lucide-react";
import { JobStatus } from "@prisma/client";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { InteractiveHomeBackground } from "@/components/motion/InteractiveHomeBackground";

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
    <div className="relative min-h-screen bg-transparent text-[#0F172A] flex flex-col overflow-x-hidden">
      {/* Interactive 3D Mascot & Dynamic Background Canvas */}
      <InteractiveHomeBackground />

      <Navbar />

      {/* HERO SECTION - Warm, bright, interactive */}
      <section id="section-hero" className="relative z-10 pt-12 pb-20 md:pt-16 md:pb-28 px-4 sm:px-8 lg:px-14">
        <div className="relative w-full max-w-7xl mx-auto text-center">
          {/* Breadcrumb / Category Tag */}
          <RevealOnScroll durationMs={500} delayMs={50} yOffset={16}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-blue-700 mb-6 backdrop-blur-md border border-blue-200/80 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Portail National de Recrutement & des Stages au Maroc</span>
            </div>
          </RevealOnScroll>

          {/* Main Headline */}
          <RevealOnScroll durationMs={650} delayMs={150} yOffset={22}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Les opportunités et entreprises qui recrutent
            </h1>
          </RevealOnScroll>

          {/* Subtitle */}
          <RevealOnScroll durationMs={600} delayMs={260} yOffset={18}>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              Découvrez les offres d&apos;emploi et stages d&apos;excellence à Casablanca, Rabat, Marrakech, Tanger et à l&apos;international.
            </p>
          </RevealOnScroll>

          {/* Search Box */}
          <RevealOnScroll durationMs={650} delayMs={380} yOffset={24} className="mt-10">
            <HeroSearch />
          </RevealOnScroll>
        </div>
      </section>

      {/* METRICS BAR (Full width, crisp animated numbers) */}
      <section className="relative z-10 w-full bg-white/85 backdrop-blur-md border-t border-b border-slate-200/80 py-6 px-4 sm:px-8 lg:px-14 shadow-sm">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#0F172A]">
              {totalActiveJobs > 0 ? (
                <AnimatedCounter value={totalActiveJobs} />
              ) : (
                "Actif"
              )}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase">Offres Actives Réelles</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-blue-600">
              {totalCompanies > 0 ? (
                <AnimatedCounter value={totalCompanies} suffix="+" />
              ) : (
                "500+"
              )}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase">Établissements Répertoriés</div>
          </div>
          <div className="border-r border-slate-100 last:border-none">
            <div className="text-3xl font-black text-[#0F172A]">Audit ATS</div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase">Score CV & Diagnostic</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600">100% Maroc</div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase">Couverture Nationale</div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section id="section-categories" className="relative z-10 py-16 px-4 sm:px-8 lg:px-14">
        <div className="w-full max-w-7xl mx-auto">
          <RevealOnScroll durationMs={500} yOffset={16}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="text-xs font-black tracking-wider text-blue-700 uppercase">
                  Filières & Secteurs
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Explorez par domaine de compétences
                </h2>
              </div>
              <Link
                href="/jobs"
                className="mt-3 md:mt-0 flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <span>Voir toutes les filières</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </RevealOnScroll>

          <StaggerContainer
            staggerMs={70}
            durationMs={550}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/jobs?category=${encodeURIComponent(cat.tag)}`}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 border border-slate-200/80 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center group h-full backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-3 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 mt-1">
                    {cat.count} offres
                  </span>
                </Link>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES LIST (Full width, Staggered Cards) */}
      <section id="section-jobs" className="relative z-10 py-16 px-4 sm:px-8 lg:px-14 bg-white/80 backdrop-blur-md border-t border-b border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto">
          <RevealOnScroll durationMs={500} yOffset={16}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-black tracking-wider text-blue-700 uppercase">
                    Offres d&apos;emploi & Stages Récents
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Dernières annonces publiées
                </h2>
              </div>
              <Link
                href="/jobs"
                className="mt-3 md:mt-0 flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <span>Accéder à toutes les offres</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </RevealOnScroll>

          <StaggerContainer
            staggerMs={80}
            durationMs={600}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
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
          </StaggerContainer>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="section-how-it-works" className="relative z-10 py-18 px-4 sm:px-8 lg:px-14">
        <div className="w-full max-w-7xl mx-auto">
          <RevealOnScroll durationMs={550} yOffset={20}>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-black tracking-wider text-blue-700 uppercase">
                Orientation & Recrutement
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                Comment postuler sur JobFinder AI ?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal">
                Un processus transparent et sécurisé pour connecter les talents aux meilleurs recruteurs du Royaume.
              </p>
            </div>
          </RevealOnScroll>

          <StaggerContainer
            staggerMs={100}
            durationMs={600}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/90 p-7 rounded-2xl border border-slate-200/90 shadow-sm text-center h-full backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl mb-4 mx-auto shadow-md shadow-blue-500/25">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recherche Ciblée</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Trouvez des postes par ville, domaine technique, contrat (Stage PFE, CDI) ou travail à distance.
              </p>
            </div>

            <div className="bg-white/90 p-7 rounded-2xl border border-slate-200/90 shadow-sm text-center h-full backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl mb-4 mx-auto shadow-md shadow-blue-500/25">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Matching CV & IA</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                L&apos;IA compare vos compétences réelles avec les exigences des recruteurs et vous propose un score objectif.
              </p>
            </div>

            <div className="bg-white/90 p-7 rounded-2xl border border-slate-200/90 shadow-sm text-center h-full backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl mb-4 mx-auto shadow-md shadow-blue-500/25">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Candidature Directe</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Postulez en un clic sur les plateformes officielles ou contactez directement les recruteurs par WhatsApp et Téléphone.
              </p>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* CALL TO ACTION SECTION (Final interactive highlight) */}
      <section id="section-cta" className="relative z-10 py-18 px-4 sm:px-8 lg:px-14 pb-24">
        <div className="w-full max-w-5xl mx-auto">
          <RevealOnScroll durationMs={650} yOffset={24}>
            <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/50 to-amber-50/40 p-8 sm:p-12 shadow-xl text-center space-y-6 backdrop-blur-md relative overflow-hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-xs font-bold text-blue-700">
                <Rocket className="h-4 w-4 text-blue-600" />
                <span>Prêt à accélérer votre carrière au Maroc ?</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Trouvez votre opportunité idéale dès aujourd&apos;hui
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Rejoignez des milliers de candidats et accédez aux meilleures offres de stages PFE et d&apos;emplois vérifiés au Royaume.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/jobs"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 text-sm font-black shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                >
                  <span>Explorer les Offres</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/companies"
                  className="rounded-xl bg-white hover:bg-slate-50 border border-slate-300 px-6 py-3.5 text-sm font-bold text-slate-700 transition-all shadow-sm"
                >
                  <span>Découvrir les Recruteurs</span>
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
