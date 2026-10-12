"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Send,
} from "lucide-react";

export interface ApplicationModalProps {
  job: {
    id: string;
    title: string;
    companyName: string;
    description: string;
    applicationMethod: "EXTERNAL" | "ASSISTED" | "AUTO_APPLY";
    officialApplyUrl?: string | null;
  };
  onClose: () => void;
}

export function ApplicationModal({ job, onClose }: ApplicationModalProps) {
  const [method] = useState<"EXTERNAL" | "ASSISTED" | "AUTO_APPLY">("ASSISTED");
  const [selectedCvId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-generate AI cover letter if empty
    handleGenerateCoverLetter();
  }, []);

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingLetter(true);
    setError(null);
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoverLetter(data.content);
      } else {
        setError(data.error || "Impossible de générer la lettre.");
      }
    } catch {
      setError("Erreur de connexion au service de génération.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleExternalRedirect = async () => {
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          method: "EXTERNAL",
          candidateApproved: true,
          externalConfirmed: false,
        }),
      });
    } catch {
      // ignore
    }

    if (job.officialApplyUrl) {
      window.open(job.officialApplyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleInPlatformSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          method,
          cvDocumentId: selectedCvId || undefined,
          coverLetterText: coverLetter || undefined,
          candidateApproved: true,
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
      } else {
        const d = await res.json();
        setError(d.error || "Erreur lors de la soumission.");
      }
    } catch {
      setError("Erreur réseau lors de l'envoi de la candidature.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl my-auto text-slate-900 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#D1E3EC]">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#1E5A6E] uppercase">
              Candidature JobFinder AI
            </span>
            <h2 className="text-lg font-bold text-[#0D2B45] mt-0.5">{job.title}</h2>
            <p className="text-xs text-slate-500">{job.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#D1E3EC] bg-[#FFFFFF] text-slate-500 hover:text-[#0D2B45]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0D2B45]/20 text-[#1E5A6E] border border-[#1E5A6E]/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#0D2B45]">Candidature transmise avec succès !</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Votre dossier et lettre de motivation ont été transmis directement par email au recruteur, et consignés dans votre tableau de bord personnel.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-5 py-2.5 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/20 hover:brightness-110"
              >
                Accéder à mes candidatures
              </a>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#D1E3EC] bg-[#FFFFFF] px-4 py-2.5 text-xs text-slate-600 hover:text-[#0D2B45]"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Direct 1-Screen Application Box */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] text-xs text-slate-700 leading-relaxed flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Votre CV actif et vos coordonnées seront transmis au recruteur.</span>
                </div>
                {job.officialApplyUrl && (
                  <button
                    type="button"
                    onClick={handleExternalRedirect}
                    className="text-[11px] font-bold text-[#1E5A6E] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Lien portail</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* AI Cover letter generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0D2B45] flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#1E5A6E]" />
                    <span>Lettre de motivation personnalisée</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingLetter}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0D2B45] bg-[#E6F0F6] hover:bg-[#0D2B45] hover:text-white px-3 py-1 rounded-lg border border-[#1E5A6E]/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isGeneratingLetter ? "Génération IA en cours..." : "Régénérer avec l'IA"}</span>
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Proposition rédigée par l'IA adaptée aux exigences du poste..."
                  className="w-full rounded-2xl border border-slate-300 bg-[#F8FAFC] p-3.5 text-xs text-[#0D2B45] font-medium leading-relaxed focus:outline-none focus:border-[#0D2B45] focus:bg-white transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleInPlatformSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0D2B45] hover:bg-[#1E5A6E] py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Envoi de l'email en cours..." : "Confirmer et envoyer ma candidature (1-Clic)"}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
