"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Briefcase,
  PlusCircle,
  Building2,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Globe,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Send,
  HelpCircle,
  Layers,
  ArrowRight,
  ChevronRight,
  Settings,
} from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  location?: string;
  city?: string;
  industry?: string;
  logoUrl?: string;
  isVerified: boolean;
}

interface ApplicationCandidate {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    candidateProfile?: {
      phone?: string | null;
      city?: string | null;
      headline?: string | null;
      yearsExperience?: number | null;
      linkedin?: string | null;
    } | null;
  };
  cvDocument?: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
  coverLetterText?: string | null;
  notes?: string | null;
  status: string;
  method: string;
  createdAt: string;
}

interface EmployerJob {
  id: string;
  title: string;
  status: string;
  category: string;
  opportunityType: string;
  workArrangement: string;
  city: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  applications: ApplicationCandidate[];
}

export default function EmployerPortalPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "post" | "applications" | "company">("listings");
  const [loading, setLoading] = useState(true);

  // Application search & filter states
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("ALL");
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<{ [appId: string]: string }>({});
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Job creation form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [skills, setSkills] = useState("");
  const [category, setCategory] = useState("Informatique & Tech");
  const [type, setType] = useState<"JOB" | "INTERNSHIP" | "APPRENTICESHIP">("JOB");
  const [arrangement, setArrangement] = useState<"ONSITE" | "HYBRID" | "REMOTE">("HYBRID");
  const [location, setLocation] = useState("Casablanca, Maroc");
  const [city, setCity] = useState("Casablanca");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("MAD");
  const [isPaidInternship, setIsPaidInternship] = useState(false);
  const [officialApplyUrl, setOfficialApplyUrl] = useState("");
  const [applicationMethod, setApplicationMethod] = useState<"EXTERNAL" | "ASSISTED" | "AUTO_APPLY">("ASSISTED");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company Edit Form State
  const [compName, setCompName] = useState("");
  const [compIndustry, setCompIndustry] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compSaving, setCompSaving] = useState(false);
  const [compMsg, setCompMsg] = useState<string | null>(null);

  useEffect(() => {
    loadEmployerData();
  }, []);

  const loadEmployerData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/jobs");
      if (res.status === 403 || res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.company) {
          setCompany(data.company);
          setCompName(data.company.name || "");
          setCompIndustry(data.company.industry || "Services & Technologies");
          setCompCity(data.company.city || "Casablanca");
          setCompWebsite(data.company.website || "");
          setCompDesc(data.company.description || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    const payload = {
      title,
      companyName: company?.name || "Mon Entreprise",
      description,
      responsibilities: responsibilities.split("\n").filter((r) => r.trim().length > 0),
      qualifications: qualifications.split("\n").filter((q) => q.trim().length > 0),
      skills: skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
      category,
      opportunityType: type,
      workArrangement: arrangement,
      location,
      country: "Morocco",
      city,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency,
      isPaidInternship: type === "INTERNSHIP" ? isPaidInternship : undefined,
      applicationMethod,
      officialApplyUrl: officialApplyUrl || undefined,
      isInternalApply: applicationMethod !== "EXTERNAL",
    };

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFormMsg({ type: "success", text: "Offre d'emploi ou de stage publiée avec succès !" });
        setTitle("");
        setDescription("");
        setResponsibilities("");
        setQualifications("");
        setSkills("");
        loadEmployerData();
        setActiveTab("listings");
      } else {
        setFormMsg({ type: "error", text: data.error || "Erreur de validation." });
      }
    } catch {
      setFormMsg({ type: "error", text: "Erreur réseau." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/employer/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: newStatus }),
      });
      if (res.ok) {
        loadEmployerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: string, messageNote?: string) => {
    setUpdatingAppId(appId);
    setReplySuccess(null);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          status: newStatus,
          notes: messageNote || undefined,
        }),
      });

      if (res.ok) {
        setReplySuccess(`Statut mis à jour et candidat notifié avec succès !`);
        setTimeout(() => setReplySuccess(null), 4000);
        loadEmployerData();
      }
    } catch (e) {
      console.error("Error updating application status:", e);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompSaving(true);
    setCompMsg(null);
    try {
      const res = await fetch("/api/employer/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: compName,
          industry: compIndustry,
          city: compCity,
          website: compWebsite,
          description: compDesc,
        }),
      });
      if (res.ok) {
        setCompMsg("Profil de l'entreprise mis à jour !");
        setTimeout(() => setCompMsg(null), 4000);
        loadEmployerData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompSaving(false);
    }
  };

  // Compute all applications across jobs
  const allApplications = jobs.flatMap((job) =>
    (job.applications || []).map((app) => ({
      ...app,
      jobTitle: job.title,
      jobId: job.id,
    }))
  );

  const filteredApplications = allApplications.filter((app) => {
    const matchesJob = selectedJobFilter === "ALL" || app.jobId === selectedJobFilter;
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchesSearch =
      candidateSearchQuery.trim() === "" ||
      app.user.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
      (app.user.candidateProfile?.headline || "").toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(candidateSearchQuery.toLowerCase());

    return matchesJob && matchesStatus && matchesSearch;
  });

  const activeJobsCount = jobs.filter((j) => j.status === "ACTIVE").length;
  const totalViews = jobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0);
  const pendingAppsCount = allApplications.filter((a) => a.status === "APPLIED" || a.status === "SAVED").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
          Chargement de l&apos;espace recruteur...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* PREMIUM ENTERPRISE HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2B45] via-[#1E5A6E] to-[#0D2B45] p-6 sm:p-8 text-white shadow-xl">
          {/* Subtle geometric background accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#6BA7A0]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 -mb-20 h-56 w-56 rounded-full bg-[#B7D4E6]/10 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-2xl sm:text-3xl shadow-inner">
                {company?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <Building2 className="h-9 w-9 text-[#B7D4E6]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {company?.name || "Espace Entreprise"}
                  </h1>
                  {company?.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#6BA7A0]/25 border border-[#6BA7A0]/40 px-3 py-1 text-xs font-bold text-[#B7D4E6]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#6BA7A0]" />
                      Partenaire Vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                      Compte Actif
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-2xl leading-relaxed">
                  Publiez vos offres d&apos;emploi et stages (PFE), recevez des candidatures qualifiées et contactez directement les talents par Téléphone, WhatsApp ou Email.
                </p>

                <div className="flex items-center gap-4 text-xs text-[#B7D4E6] mt-3 flex-wrap font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {company?.city || "Casablanca"}, Maroc
                  </span>
                  <span>•</span>
                  <span>Secteur : {company?.industry || "Services & Technologies"}</span>
                  {company?.website && (
                    <>
                      <span>•</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Site web
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab("applications")}
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
              >
                <Users className="h-4 w-4 text-[#B7D4E6]" />
                <span>Candidatures ({allApplications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("post")}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#0D2B45] hover:bg-slate-100 shadow-lg shadow-black/20 transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-[#1E5A6E]" />
                <span>Publier une opportunité</span>
              </button>
            </div>
          </div>
        </div>

        {/* METRICS & KPIS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#1E5A6E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Offres en ligne
              </span>
              <div className="rounded-xl bg-[#E6F0F6] p-2 text-[#0D2B45]">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0D2B45]">{activeJobsCount}</span>
              <span className="text-xs text-slate-500">/ {jobs.length} totales</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#1E5A6E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Candidatures Reçues
              </span>
              <div className="rounded-xl bg-teal-50 p-2 text-[#1E5A6E]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1E5A6E]">{allApplications.length}</span>
              <span className="text-xs text-emerald-700 font-bold">dossiers complets</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#1E5A6E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                À traiter en priorité
              </span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">{pendingAppsCount}</span>
              <span className="text-xs text-slate-500">en attente de retour</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#1E5A6E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vues sur le portail
              </span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0D2B45]">{totalViews}</span>
              <span className="text-xs text-slate-500">consultations</span>
            </div>
          </div>
        </div>

        {/* Global Success Notification */}
        {replySuccess && (
          <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{replySuccess}</span>
          </div>
        )}

        {/* MODERN NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-200 gap-3 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "listings"
                ? "border-[#0D2B45] text-[#0D2B45] font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Mes offres & stages ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "applications"
                ? "border-[#0D2B45] text-[#0D2B45] font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Candidatures reçues & Contact ({allApplications.length})</span>
            {pendingAppsCount > 0 && (
              <span className="ml-1 rounded-full bg-[#1E5A6E] text-white px-2 py-0.5 text-[10px]">
                {pendingAppsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("post")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "post"
                ? "border-[#0D2B45] text-[#0D2B45] font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publier une opportunité</span>
          </button>

          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "company"
                ? "border-[#0D2B45] text-[#0D2B45] font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Profil Entreprise</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OFFRES & STAGES LISTINGS */}
        {/* ========================================================================= */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F0F6] text-[#0D2B45] mb-4">
                  <Briefcase className="h-8 w-8 text-[#1E5A6E]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Aucune offre ou stage publié pour le moment
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Créez votre première offre en 2 minutes. Elle sera visible instantanément par les candidats de JobFinder AI à travers tout le Maroc.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab("post")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-6 py-3 text-xs font-black text-white shadow-md transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Créer une offre d&apos;emploi ou de stage</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#0D2B45]">
                          {job.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            job.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {job.status === "ACTIVE" ? "En ligne" : "En pause"}
                        </span>
                        <span className="rounded-lg bg-[#E6F0F6] text-[#0D2B45] px-2.5 py-0.5 text-[11px] font-semibold border border-[#1E5A6E]/20">
                          {job.opportunityType === "INTERNSHIP" ? "Stage / PFE" : "Emploi"}
                        </span>
                        <span className="rounded-lg bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">
                          {job.workArrangement === "REMOTE" ? "Télétravail" : job.workArrangement === "HYBRID" ? "Hybride" : "Sur site"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-[#1E5A6E]" />
                          {job.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          {job.viewsCount} vues
                        </span>
                        <span>•</span>
                        <button
                          onClick={() => {
                            setSelectedJobFilter(job.id);
                            setActiveTab("applications");
                          }}
                          className="flex items-center gap-1 font-bold text-[#1E5A6E] hover:underline cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5 text-[#1E5A6E]" />
                          {job.applications?.length || 0} candidat(s)
                        </button>
                        <span>•</span>
                        <span>Publiée le {new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveTab("applications");
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Voir candidats ({job.applications?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                      >
                        {job.status === "ACTIVE" ? (
                          <>
                            <Pause className="h-3.5 w-3.5 text-amber-600" />
                            <span>Mettre en pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Réactiver</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-all"
                      >
                        <span>Aperçu</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CANDIDATURES REÇUES & CONTACT DIRECT */}
        {/* ========================================================================= */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Control Bar: Filters & Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-[#0D2B45]">
                    Gestion des Candidatures & Prise de Contact
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Téléchargez les CVs et échangez directement avec vos candidats par Téléphone, WhatsApp ou Email.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Total :</span>
                  <span className="rounded-lg bg-[#E6F0F6] px-2.5 py-1 text-xs font-black text-[#0D2B45]">
                    {filteredApplications.length} candidature(s)
                  </span>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email, compétence..."
                    value={candidateSearchQuery}
                    onChange={(e) => setCandidateSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>

                {/* Filter by Job */}
                <div>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="ALL">Toutes les offres ({allApplications.length})</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.applications?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Status */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="APPLIED">Nouveau / Postulé</option>
                    <option value="REVIEWED">En cours d&apos;examen</option>
                    <option value="INTERVIEW_SCHEDULED">Entretien planifié</option>
                    <option value="ACCEPTED">Retenu</option>
                    <option value="REJECTED">Non retenu</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3">
                  <Users className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Aucune candidature ne correspond aux critères
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Modifiez vos filtres ou attendez que les candidats postulent à vos opportunités.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredApplications.map((app) => {
                  const candidate = app.user;
                  const profile = candidate.candidateProfile;
                  const phone = profile?.phone;
                  const email = candidate.email;

                  return (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-5"
                    >
                      {/* Top Header: Candidate Identity & Target Job */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D2B45] text-white font-black text-lg shrink-0 shadow-sm">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-base font-black text-[#0D2B45]">
                                {candidate.name}
                              </h3>
                              <span className="rounded-md bg-[#E6F0F6] px-2 py-0.5 text-[11px] font-bold text-[#0D2B45]">
                                Poste : {app.jobTitle}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                              {profile?.headline && (
                                <span className="text-slate-800 font-bold">{profile.headline}</span>
                              )}
                              {profile?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  {profile.city}
                                </span>
                              )}
                              {profile?.yearsExperience !== undefined && profile?.yearsExperience !== null && (
                                <span>💼 {profile.yearsExperience} an(s) d&apos;exp.</span>
                              )}
                              <span>📅 Reçu le {new Date(app.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-2 self-start">
                          <span className="text-xs text-slate-500 font-bold">Statut :</span>
                          <select
                            value={app.status}
                            disabled={updatingAppId === app.id}
                            onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                            className="rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-black text-[#0D2B45] focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                          >
                            <option value="SAVED">Enregistré</option>
                            <option value="APPLIED">Nouveau / Postulé</option>
                            <option value="REVIEWED">En cours d&apos;examen</option>
                            <option value="INTERVIEW_SCHEDULED">Entretien planifié</option>
                            <option value="ACCEPTED">Candidature Retenue</option>
                            <option value="REJECTED">Non retenue</option>
                          </select>
                        </div>
                      </div>

                      {/* Middle: Candidate Message & Document */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Lettre de motivation / Message du candidat
                          </span>
                          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line max-h-44 overflow-y-auto">
                            {app.coverLetterText || app.notes || (
                              <span className="text-slate-400 italic">
                                Le candidat a transmis son dossier direct sans lettre additionnelle.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Dossier & CV
                          </span>
                          {app.cvDocument?.fileUrl ? (
                            <a
                              href={app.cvDocument.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3.5 rounded-xl border border-[#1E5A6E]/30 bg-[#E6F0F6] text-xs font-black text-[#0D2B45] hover:bg-[#D1E3EC] transition-colors shadow-sm"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <FileText className="h-4 w-4 text-[#1E5A6E] shrink-0" />
                                <span className="truncate">{app.cvDocument.fileName || "Consulter le CV"}</span>
                              </div>
                              <ExternalLink className="h-4 w-4 shrink-0 text-[#1E5A6E]" />
                            </a>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 text-center">
                              Aucun fichier CV attaché
                            </div>
                          )}

                          {profile?.linkedin && (
                            <a
                              href={profile.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-[#0D2B45] hover:border-slate-300 transition-colors"
                            >
                              <span>Profil LinkedIn officiel</span>
                              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Direct Candidate Actions Strip */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-black text-[#0D2B45]">Contacter directement :</span>

                          {/* Email */}
                          <a
                            href={`mailto:${email}?subject=Suite à votre candidature pour ${encodeURIComponent(app.jobTitle)} chez ${encodeURIComponent(company?.name || "notre entreprise")}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 text-[#1E5A6E]" />
                            <span>Email : {email}</span>
                          </a>

                          {/* Phone / Call */}
                          {phone ? (
                            <>
                              <a
                                href={`tel:${phone}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                              >
                                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Appeler : {phone}</span>
                              </a>

                              {/* WhatsApp Direct */}
                              <a
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Bonjour%20${encodeURIComponent(candidate.name)},%20nous%20avons%20bien%20re%C3%A7u%20votre%20candidature%20pour%20le%20poste%20de%20${encodeURIComponent(app.jobTitle)}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-sm transition-all"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp direct</span>
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Numéro de téléphone non renseigné
                            </span>
                          )}
                        </div>

                        {/* Internal candidate feedback message */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Message de suivi au candidat..."
                            value={replyMessage[app.id] || ""}
                            onChange={(e) =>
                              setReplyMessage({ ...replyMessage, [app.id]: e.target.value })
                            }
                            className="rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white w-full sm:w-60"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const msg = replyMessage[app.id];
                              if (msg) {
                                handleUpdateApplicationStatus(app.id, app.status, msg);
                                setReplyMessage({ ...replyMessage, [app.id]: "" });
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2 text-xs font-black text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Notifier</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PUBLIER UNE OFFRE / STAGE */}
        {/* ========================================================================= */}
        {activeTab === "post" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg sm:text-xl font-black text-[#0D2B45]">
                Dépôt d&apos;une opportunité d&apos;emploi ou de stage
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Remplissez les détails ci-dessous. Dès publication, votre annonce est instantanément indexée et visible par tous les candidats connectés.
              </p>
            </div>

            {formMsg && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                  formMsg.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {formMsg.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                )}
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePostJob} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Intitulé du poste ou stage *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Développeur React / Next.js ou Stagiaire PFE Data Engineer"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Secteur / Domaine d&apos;activité *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="Informatique & Tech">Informatique & Tech</option>
                    <option value="Data & Intelligence Artificielle">Data & Intelligence Artificielle</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersécurité & Réseaux">Cybersécurité & Réseaux</option>
                    <option value="Banque & Fintech">Banque & Fintech</option>
                    <option value="Industrie & Ingénierie">Industrie & Ingénierie</option>
                    <option value="Commerce & Marketing">Commerce & Marketing</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Type d&apos;opportunité *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="JOB">Emploi (CDI / CDD)</option>
                    <option value="INTERNSHIP">Stage & PFE</option>
                    <option value="APPRENTICESHIP">Alternance</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Mode de travail
                  </label>
                  <select
                    value={arrangement}
                    onChange={(e) => setArrangement(e.target.value as typeof arrangement)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="HYBRID">Hybride</option>
                    <option value="ONSITE">Sur site</option>
                    <option value="REMOTE">Télétravail complet (Remote)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Ville principale au Maroc *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setLocation(`${e.target.value}, Maroc`);
                    }}
                    placeholder="Casablanca, Rabat, Tanger..."
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                  Description détaillée du poste ou du stage *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Présentez l'environnement de travail, les enjeux du projet, les technologies utilisées..."
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Responsibilities & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Missions & Responsabilités (une par ligne) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="Concevoir les composants frontend React&#10;Intégrer les APIs REST / GraphQL&#10;Participer aux revues de code et tests"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Profil recherché (un critère par ligne) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="Formation Bac+5 en informatique / école d'ingénieurs&#10;Expérience ou projets solides sur TypeScript & Next.js&#10;Autonomie et esprit d'équipe"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Skills tags */}
              <div>
                <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                  Compétences clés requises (séparées par des virgules) *
                </label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Next.js, PostgreSQL, Docker, Git"
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                />
              </div>

              {/* Salary & Compensation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Rémunération min (mensuelle)
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="12000"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Rémunération max
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="18000"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Devise
                  </label>
                  <select
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="MAD">MAD (Dirham Marocain)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Paid internship checkbox */}
              {type === "INTERNSHIP" && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="isPaidInternship"
                    checked={isPaidInternship}
                    onChange={(e) => setIsPaidInternship(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0D2B45] cursor-pointer"
                  />
                  <label htmlFor="isPaidInternship" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Stage avec indemnité mensuelle (Stage rémunéré)
                  </label>
                </div>
              )}

              {/* Application Method & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Mode de réception des candidatures
                  </label>
                  <select
                    value={applicationMethod}
                    onChange={(e) => setApplicationMethod(e.target.value as typeof applicationMethod)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="ASSISTED">Candidature directe interne (Recommandé - CV & contact dans cet espace)</option>
                    <option value="EXTERNAL">Redirection vers portail externe officiel</option>
                  </select>
                </div>

                {applicationMethod === "EXTERNAL" && (
                  <div>
                    <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                      URL officielle de candidature *
                    </label>
                    <input
                      type="url"
                      required={applicationMethod === "EXTERNAL"}
                      value={officialApplyUrl}
                      onChange={(e) => setOfficialApplyUrl(e.target.value)}
                      placeholder="https://carrieres.monentreprise.com/offre-123"
                      className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-8 py-3.5 font-black text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs"
                >
                  {isSubmitting ? "Publication en cours..." : "Publier l'offre sur la plateforme"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PROFIL DE L'ENTREPRISE */}
        {/* ========================================================================= */}
        {activeTab === "company" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg sm:text-xl font-black text-[#0D2B45]">
                Informations & Identité de l&apos;Entreprise
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ces informations sont visibles sur chacune de vos fiches d&apos;offres et dans l&apos;annuaire des entreprises qui recrutent.
              </p>
            </div>

            {compMsg && (
              <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{compMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCompany} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Raison Sociale / Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Secteur d&apos;activité
                  </label>
                  <input
                    type="text"
                    value={compIndustry}
                    onChange={(e) => setCompIndustry(e.target.value)}
                    placeholder="Formation & Éducation, Technologies, Banque..."
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Ville du siège
                  </label>
                  <input
                    type="text"
                    value={compCity}
                    onChange={(e) => setCompCity(e.target.value)}
                    placeholder="Casablanca, Rabat..."
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                    Site web officiel
                  </label>
                  <input
                    type="url"
                    value={compWebsite}
                    onChange={(e) => setCompWebsite(e.target.value)}
                    placeholder="https://www.ofppt.ma"
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-black block mb-1.5 uppercase text-[11px] tracking-wider">
                  Présentation de l&apos;entreprise
                </label>
                <textarea
                  rows={4}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="Décrivez les activités clés, la culture d'entreprise et les avantages pour les talents..."
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#1E5A6E] focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={compSaving}
                  className="rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-8 py-3.5 font-black text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs"
                >
                  {compSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
