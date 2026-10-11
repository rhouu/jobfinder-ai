"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  User,
  FileText,
  Briefcase,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Send,
  Award,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Gauge,
  Check,
  Printer,
} from "lucide-react";
import { AtsCvExportModal } from "@/components/AtsCvExportModal";

interface AtsAuditResult {
  score: number;
  level: "Excellent" | "Très bon" | "Moyen" | "À améliorer";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  breakdown: {
    formatting: number;
    skillsImpact: number;
    contactCompleteness: number;
    educationExperience: number;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  candidateProfile?: {
    headline?: string;
    bio?: string;
    location?: string;
    skills: string[];
    preferredLocation?: string;
  };
  cvDocuments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  }>;
}

interface ApplicationItem {
  id: string;
  status: string;
  method: string;
  appliedAt?: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    city: string;
    country: string;
  };
  events: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

export default function CandidateDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cv" | "applications" | "profile">("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // CV Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Matching trigger
  const [isMatching, setIsMatching] = useState(false);
  const [matchDoneMsg, setMatchDoneMsg] = useState<string | null>(null);

  // ATS CV Audit state
  const [atsAudit, setAtsAudit] = useState<AtsAuditResult | null>(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const fetchAtsAudit = async () => {
    setLoadingAts(true);
    try {
      const res = await fetch("/api/cv/ats-analyze");
      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          setAtsAudit(data.audit);
        }
      }
    } catch (e) {
      console.warn("ATS audit fetch error:", e);
    } finally {
      setLoadingAts(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(meData.user);

      // Fetch applications
      const appRes = await fetch("/api/applications");
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }

      // If user has CV, load ATS audit
      if (meData.user?.cvDocuments && meData.user.cvDocuments.length > 0) {
        fetchAtsAudit();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Veuillez sélectionner un fichier CV.");
      return;
    }
    if (!consent) {
      setUploadError("Veuillez autoriser le traitement de vos données pour l'analyse IA.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("consent", "true");

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadSuccess(true);
        loadData();
        fetchAtsAudit();
      } else {
        setUploadError(data.error || "Erreur lors de l'upload du CV.");
      }
    } catch {
      setUploadError("Erreur réseau.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAiMatching = async () => {
    setIsMatching(true);
    setMatchDoneMsg(null);
    try {
      const res = await fetch("/api/cv/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setMatchDoneMsg(`Score IA mis à jour avec succès pour ${data.count} opportunités.`);
      } else {
        setMatchDoneMsg(data.error || "Erreur de matching.");
      }
    } catch {
      setMatchDoneMsg("Erreur réseau.");
    } finally {
      setIsMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
          Chargement de votre espace personnel...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header Card */}
        <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/85 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0D2B45] via-[#8E5E47] to-[#1E5A6E] text-[#F4F8FA] font-bold text-2xl shadow-lg shadow-[#0D2B45]/20">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h1>
                <span className="rounded-full bg-[#0D2B45]/25 border border-[#1E5A6E]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#1E5A6E]">
                  Candidat
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user?.candidateProfile?.headline || "Profil Talents & Carrières"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#1E5A6E]/40 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#0D2B45] shadow-sm transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#1E5A6E]" />
              <span>Exporter mon CV ATS (PDF)</span>
            </button>
            <button
              onClick={handleRunAiMatching}
              disabled={isMatching}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-4 py-2.5 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/25 hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isMatching ? "Analyse IA en cours..." : "Actualiser Matching IA"}</span>
            </button>
          </div>
        </div>

        {matchDoneMsg && (
          <div className="p-3 rounded-xl border border-[#1E5A6E]/30 bg-[#0D2B45]/20 text-xs text-[#1E5A6E] flex items-center justify-between">
            <span>{matchDoneMsg}</span>
            <button onClick={() => setMatchDoneMsg(null)} className="text-slate-400 hover:text-slate-900">✕</button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-[#D1E3EC] gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: Briefcase },
            { id: "cv", label: "Mon CV & Compétences IA", icon: FileText },
            { id: "applications", label: `Mes Candidatures (${applications.length})`, icon: Send },
            { id: "profile", label: "Mon Profil & Préférences", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#1E5A6E] text-[#1E5A6E]"
                    : "border-transparent text-slate-400 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Candidatures</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{applications.length}</span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">CV Actifs</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">
                  {user?.cvDocuments?.length || 0}
                </span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">En Entretien</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">
                  {applications.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "INTERVIEW").length}
                </span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Compétences Détectées</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">
                  {user?.candidateProfile?.skills?.length || 0}
                </span>
              </div>
            </div>

            {/* Recent Applications preview */}
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Suivi récent des candidatures</h2>
                <button
                  onClick={() => setActiveTab("applications")}
                  className="text-xs text-[#1E5A6E] hover:underline"
                >
                  Voir tout
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Vous n&apos;avez encore soumis aucune candidature.{" "}
                  <Link href="/jobs" className="text-[#1E5A6E] underline">
                    Explorer les offres disponibles
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#D1E3EC] text-xs">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{app.job.title}</h3>
                        <p className="text-slate-400">{app.job.companyName} • {app.job.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#0D2B45]/25 border border-[#1E5A6E]/30 px-2.5 py-1 text-[11px] font-semibold text-[#1E5A6E]">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY CV & SKILLS */}
        {activeTab === "cv" && (
          <div className="space-y-8">
            {/* Upload CV Box */}
            <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/85 p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-[#1E5A6E]" />
                    Importer un nouveau CV (PDF ou DOCX)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Notre moteur sécurisé extrait automatiquement vos compétences pour calculer la compatibilité avec les offres.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-cyan-300" />
                  <span>Générer CV ATS Maroc (PDF)</span>
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="border-2 border-dashed border-[#D1E3EC] rounded-2xl p-6 text-center hover:border-[#1E5A6E]/60 transition-colors">
                  <input
                    type="file"
                    id="cvInput"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="cvInput" className="cursor-pointer block">
                    <FileText className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-900 block">
                      {uploadFile ? uploadFile.name : "Cliquez ici pour sélectionner votre fichier CV"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Formats supportés : PDF, DOCX (Max 5 Mo). Vos données sont strictement confidentielles.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="cvConsent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D1E3EC] bg-[#F4F8FA] text-[#0D2B45]"
                  />
                  <label htmlFor="cvConsent" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                    J&apos;autorise JobFinder AI à extraire et traiter le contenu de mon CV à des fins exclusives de matching d&apos;opportunités professionnelles.
                  </label>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 rounded-xl border border-[#1E5A6E]/30 bg-[#0D2B45]/20 text-xs text-[#1E5A6E] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>CV analysé avec succès ! Vos compétences ont été extraites.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile || !consent}
                  className="rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-5 py-2.5 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/25 hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? "Extraction en cours..." : "Analyser et enregistrer mon CV"}
                </button>
              </form>
            </div>

            {/* ATS CV SCORE & DIAGNOSTIC SIMULATOR (Idea 1) */}
            {atsAudit && (
              <div className="rounded-3xl border border-[#1E5A6E]/30 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F0F6] px-3 py-1 text-xs font-bold text-[#0D2B45] mb-2">
                      <Gauge className="h-3.5 w-3.5 text-[#1E5A6E]" />
                      <span>Audit ATS & Diagnostic Marché Marocain</span>
                    </div>
                    <h3 className="text-xl font-black text-[#0D2B45]">
                      Score d&apos;efficacité ATS de votre CV
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Évalue la lisibilité de votre document par les logiciels de recrutement et sa pertinence pour les recruteurs au Maroc.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F4F8FA] border border-slate-200 rounded-2xl p-4">
                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block">Niveau global</span>
                      <span className={`text-sm font-black ${
                        atsAudit.score >= 70 ? "text-emerald-700" : atsAudit.score >= 50 ? "text-amber-700" : "text-rose-700"
                      }`}>
                        {atsAudit.level}
                      </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-[#0D2B45] text-white flex items-center justify-center text-xl font-black shadow-md">
                      {atsAudit.score}%
                    </div>
                  </div>
                </div>

                {/* Sub-scores breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Structure & Format</span>
                    <span className="text-lg font-black text-[#0D2B45]">{atsAudit.breakdown.formatting} / 25</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Impact Compétences</span>
                    <span className="text-lg font-black text-[#0D2B45]">{atsAudit.breakdown.skillsImpact} / 35</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Coordonnées & Contact</span>
                    <span className="text-lg font-black text-[#0D2B45]">{atsAudit.breakdown.contactCompleteness} / 20</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Formation & Expériences</span>
                    <span className="text-lg font-black text-[#0D2B45]">{atsAudit.breakdown.educationExperience} / 20</span>
                  </div>
                </div>

                {/* Feedback 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Points Forts */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <Check className="h-4 w-4" />
                      <h4>Points Forts Détectés</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                      {atsAudit.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Points à Améliorer */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <h4>Points à Optimiser</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-amber-950 font-medium">
                      {atsAudit.weaknesses.length > 0 ? (
                        atsAudit.weaknesses.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{w}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">Aucune faiblesse majeure détectée.</li>
                      )}
                    </ul>
                  </div>

                  {/* Recommandations Recrutement Maroc */}
                  <div className="p-5 rounded-2xl bg-[#E6F0F6] border border-[#B7D4E6] space-y-3">
                    <div className="flex items-center gap-2 text-[#0D2B45] font-black text-sm">
                      <Lightbulb className="h-4 w-4 text-[#1E5A6E]" />
                      <h4>Conseils Spécifiques Maroc</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-800 font-medium">
                      {atsAudit.recommendations.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#1E5A6E] font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Skills overview */}
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Compétences extraites de votre profil</h3>
                <p className="text-xs text-slate-400">
                  Ces technologies sont prises en compte pour le calcul du score de match.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {user?.candidateProfile?.skills && user.candidateProfile.skills.length > 0 ? (
                  user.candidateProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-[#1E5A6E]/30 bg-[#0D2B45]/20 px-3 py-1.5 text-xs font-semibold text-[#1E5A6E] flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Aucun CV n&apos;a encore été analysé. Téléchargez votre CV ci-dessus pour détecter automatiquement vos compétences.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APPLICATIONS TRACKER */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tableau de bord de suivi des candidatures</h2>
              <p className="text-xs text-slate-400 mt-1">
                Suivez en temps réel l&apos;état d&apos;avancement de chaque opportunité postulée.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/60 p-12 text-center text-xs text-slate-400">
                Vous n&apos;avez encore aucune candidature en cours.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-5 backdrop-blur-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#1E5A6E] uppercase tracking-wider">
                          Méthode : {app.method}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{app.job.title}</h3>
                        <p className="text-xs text-slate-400">
                          {app.job.companyName} • {app.job.city}, {app.job.country}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span className="rounded-xl bg-[#0D2B45]/25 border border-[#1E5A6E]/30 px-3 py-1 text-xs font-bold text-[#1E5A6E]">
                          {app.status}
                        </span>

                        <Link
                          href={`/jobs/${app.job.id}`}
                          className="p-2 rounded-xl border border-[#D1E3EC] text-slate-400 hover:text-slate-900"
                          title="Voir l'offre"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Timeline events */}
                    {app.events && app.events.length > 0 && (
                      <div className="pt-3 border-t border-[#D1E3EC] text-xs space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Historique d&apos;activité :
                        </span>
                        {app.events.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-2 text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-[#1E5A6E] shrink-0" />
                            <span>{ev.description}</span>
                            <span className="text-[10px] text-slate-400">
                              ({new Date(ev.createdAt).toLocaleDateString("fr-FR")})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Informations de profil</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nom complet</label>
                <div className="p-3 rounded-xl bg-[#F4F8FA] border border-[#D1E3EC] text-slate-900 font-medium">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Adresse email</label>
                <div className="p-3 rounded-xl bg-[#F4F8FA] border border-[#D1E3EC] text-slate-900 font-medium">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Localisation préférée</label>
                <div className="p-3 rounded-xl bg-[#F4F8FA] border border-[#D1E3EC] text-slate-900 font-medium">
                  {user?.candidateProfile?.preferredLocation || "Casablanca, Maroc"}
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Titre / Spécialité</label>
                <div className="p-3 rounded-xl bg-[#F4F8FA] border border-[#D1E3EC] text-slate-900 font-medium">
                  {user?.candidateProfile?.headline || "Ingénieur Fullstack / IA"}
                </div>
              </div>
            </div>
          </div>
        )}

        {isExportModalOpen && user && (
          <AtsCvExportModal
            user={user}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
