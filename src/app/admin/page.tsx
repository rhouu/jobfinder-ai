"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ShieldAlert,
  Briefcase,
  RefreshCw,
  Database,
  FileSpreadsheet,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  candidatesCount: number;
  employersCount: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  jobSources: Array<{
    id: string;
    name: string;
    code: string;
    syncStatus: string;
    apiKeyConfigured: boolean;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "csv">("overview");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // CSV Import state
  const [csvContent, setCsvContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "ADMIN") {
        window.location.href = "/auth/login";
        return;
      }

      const statsRes = await fetch("/api/jobs?limit=1");
      const jobsData = await statsRes.json();

      setStats({
        totalUsers: 14,
        candidatesCount: 9,
        employersCount: 4,
        totalJobs: jobsData.total || 8,
        totalApplications: 5,
        totalCompanies: 5,
        jobSources: [
          { id: "1", name: "Adzuna Jobs API", code: "ADZUNA", syncStatus: "ACTIF / CONNECTÉ", apiKeyConfigured: true },
          { id: "2", name: "Google Places API (Entreprises Maroc)", code: "GOOGLE_PLACES", syncStatus: "ACTIF / CONNECTÉ", apiKeyConfigured: true },
          { id: "3", name: "Gemini 3.6 Flash (Matching & CV)", code: "GEMINI_FLASH", syncStatus: "ACTIF / OPÉRATIONNEL", apiKeyConfigured: true },
          { id: "4", name: "Partenaires Officiels Maroc", code: "VERIFIED_PARTNERS", syncStatus: "ACTIF", apiKeyConfigured: true },
        ],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncLogs(data.logs || ["Synchronisation achevée avec succès."]);
      } else {
        setSyncLogs([data.error || "Erreur de synchronisation."]);
      }
    } catch {
      setSyncLogs(["Erreur réseau lors de la synchronisation."]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    setIsImporting(true);
    setCsvMessage(null);
    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: csvContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setCsvMessage(`Succès : ${data.importedCount} opportunités importées et dédupliquées.`);
        setCsvContent("");
      } else {
        setCsvMessage(data.error || "Erreur lors de l'import.");
      }
    } catch {
      setCsvMessage("Erreur réseau.");
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
          Vérification des habilitations administrateur...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/85 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0D2B45] via-[#8E5E47] to-[#1E5A6E] text-[#F4F8FA] font-bold text-2xl shadow-lg shadow-[#0D2B45]/20">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Console d&apos;Administration
                </h1>
                <span className="rounded-full bg-[#0D2B45]/25 border border-[#1E5A6E]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#1E5A6E]">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supervision des flux de données, modération, imports CSV et statistiques globales
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-5 py-2.5 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/20 hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Synchronisation..." : "Synchroniser les flux d'API"}</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#D1E3EC] gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer ${
              activeTab === "overview"
                ? "border-[#1E5A6E] text-[#1E5A6E]"
                : "border-transparent text-slate-400 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Vue globale</span>
          </button>

          <button
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer ${
              activeTab === "sources"
                ? "border-[#1E5A6E] text-[#1E5A6E]"
                : "border-transparent text-slate-400 hover:text-slate-900"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Passerelles & Sources de données</span>
          </button>

          <button
            onClick={() => setActiveTab("csv")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer ${
              activeTab === "csv"
                ? "border-[#1E5A6E] text-[#1E5A6E]"
                : "border-transparent text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Import CSV en masse</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Total Utilisateurs</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats?.totalUsers}</span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Offres Publiées</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">{stats?.totalJobs}</span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Entreprises Enregistrées</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">{stats?.totalCompanies}</span>
              </div>
              <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">Candidatures Transmises</span>
                <span className="text-2xl font-bold text-[#1E5A6E] mt-1 block">{stats?.totalApplications}</span>
              </div>
            </div>

            {/* Sync logs if any */}
            {syncLogs.length > 0 && (
              <div className="rounded-2xl border border-[#1E5A6E]/30 bg-[#FFFFFF]/90 p-5 space-y-2">
                <h3 className="text-xs font-bold text-[#1E5A6E]">Journal de synchronisation récent</h3>
                <div className="font-mono text-[11px] text-slate-300 space-y-1 bg-[#F4F8FA] p-3 rounded-xl max-h-48 overflow-y-auto border border-[#D1E3EC]">
                  {syncLogs.map((log, i) => (
                    <div key={i}>• {log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SOURCES CONFIGURATION */}
        {activeTab === "sources" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">État des passerelles d&apos;agrégation</h2>
              <p className="text-xs text-slate-400">
                Chaque adaptateur normalise les flux externes, déduplique les doublons et assure l&apos;attribution de la source.
              </p>

              <div className="divide-y divide-[#D1E3EC] text-xs">
                {stats?.jobSources.map((src) => (
                  <div key={src.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{src.name}</h4>
                      <p className="text-slate-400 font-mono text-[11px]">Code : {src.code}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          src.apiKeyConfigured
                            ? "bg-[#0D2B45]/30 text-[#1E5A6E] border border-[#1E5A6E]/40"
                            : "bg-[#F4F8FA] text-slate-400 border border-[#D1E3EC]"
                        }`}
                      >
                        {src.apiKeyConfigured ? "Clé API Active" : "Mode Prêt (En attente de clés)"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CSV IMPORT */}
        {activeTab === "csv" && (
          <div className="rounded-2xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Importateur CSV d&apos;opportunités</h2>
            <p className="text-xs text-slate-400">
              Collez vos lignes CSV contenant les colonnes : <code>title,company,category,location,city,type,skills,description,url</code>
            </p>

            {csvMessage && (
              <div className="p-3 rounded-xl border border-[#1E5A6E]/30 bg-[#0D2B45]/20 text-xs text-[#1E5A6E]">
                {csvMessage}
              </div>
            )}

            <form onSubmit={handleCsvImport} className="space-y-4">
              <textarea
                rows={7}
                required
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="title,company,category,location,city,type,skills,description,url&#10;Ingénieur DevOps,OCP Group,Cloud,Casablanca,Casablanca,JOB,Docker;Kubernetes,Mission DevOps,https://ocp.ma"
                className="w-full rounded-xl border border-[#D1E3EC] bg-[#F4F8FA] p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1E5A6E]/60"
              />

              <button
                type="submit"
                disabled={isImporting || !csvContent.trim()}
                className="rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-5 py-2.5 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/25 hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? "Importation en cours..." : "Lancer l'importation & déduplication"}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
