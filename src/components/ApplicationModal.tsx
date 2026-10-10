"use client";

import React, { useState, useEffect } from "react";
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
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();

  const [method, setMethod] = useState<"EXTERNAL" | "ASSISTED" | "AUTO_APPLY">(
    job.applicationMethod || "ASSISTED"
  );
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [notes, setNotes] = useState("");
  const [candidateApproved, setCandidateApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleConfirmExternalSubmission = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          method: "EXTERNAL",
          candidateApproved: true,
          externalConfirmed: true,
          notes,
        }),
      });
      if (res.ok) {
        setSubmittedSuccess(true);
      } else {
        const d = await res.json();
        setError(d.error || "Erreur lors de la validation.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInPlatformSubmit = async () => {
    if (!candidateApproved) {
      setError("Vous devez explicitement vérifier et approuver votre candidature avant soumission.");
      return;
    }

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
          notes,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl rounded-2xl border border-[#D1E3EC] bg-[#F4F8FA] p-6 shadow-2xl my-8 text-[#0D2B45] max-h-[90vh] overflow-y-auto"
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
            <h3 className="text-base font-bold text-[#0D2B45]">Candidature enregistrée avec succès !</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Votre candidature a été consignée dans votre tableau de bord de suivi personnel. Vous pouvez y ajouter des notes, planifier vos rappels et suivre chaque étape.
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
          <div className="space-y-5 pt-4">
            {/* Workflow selector tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#FFFFFF] border border-[#D1E3EC] text-xs">
              <button
                type="button"
                onClick={() => setMethod("EXTERNAL")}
                className={`py-2 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                  method === "EXTERNAL"
                    ? "bg-[#0D2B45] text-[#1E5A6E] font-bold shadow"
                    : "text-slate-500 hover:text-[#0D2B45]"
                }`}
              >
                1. Externe
              </button>
              <button
                type="button"
                onClick={() => setMethod("ASSISTED")}
                className={`py-2 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                  method === "ASSISTED"
                    ? "bg-[#0D2B45] text-[#1E5A6E] font-bold shadow"
                    : "text-slate-500 hover:text-[#0D2B45]"
                }`}
              >
                2. Assistée
              </button>
              <button
                type="button"
                onClick={() => setMethod("AUTO_APPLY")}
                className={`py-2 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                  method === "AUTO_APPLY"
                    ? "bg-[#0D2B45] text-[#1E5A6E] font-bold shadow"
                    : "text-slate-500 hover:text-[#0D2B45]"
                }`}
              >
                3. Auto-Apply
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* METHOD A: External Application */}
            {method === "EXTERNAL" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#0D2B45]/40 bg-[#FFFFFF] text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold text-[#1E5A6E] mb-1">
                    <ExternalLink className="h-4 w-4" />
                    Candidature sur le portail officiel de l&apos;employeur
                  </div>
                  Cette opportunité requiert de postuler directement sur le site officiel de l&apos;entreprise ou du partenaire. Cliquez ci-dessous pour ouvrir la page sécurisée.
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExternalRedirect}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] py-3 text-xs font-bold text-[#F4F8FA] shadow-md shadow-[#0D2B45]/25 hover:brightness-110 cursor-pointer"
                  >
                    <span>Ouvrir le site officiel</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-[#D1E3EC] space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Avez-vous complété votre candidature externe ?
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Marquez-la comme postulée pour activer les rappels de relance et le suivi automatique dans votre espace.
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmExternalSubmission}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1E5A6E]/40 bg-[#1E5A6E]/10 py-2.5 text-xs font-semibold text-[#1E5A6E] hover:bg-[#1E5A6E]/20 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>J&apos;ai postulé (Enregistrer dans mon suivi)</span>
                  </button>
                </div>
              </div>
            )}

            {/* METHOD B: Assisted Application */}
            {method === "ASSISTED" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-[#0D2B45]/40 bg-[#FFFFFF] text-xs text-slate-600">
                  <div className="font-semibold text-[#1E5A6E] flex items-center gap-1.5 mb-1">
                    <FileText className="h-4 w-4" />
                    Candidature directe assistée par IA
                  </div>
                  Générez une lettre de motivation sur-mesure adaptée aux compétences requises et validez votre dossier.
                </div>

                {/* AI Cover letter generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Lettre de motivation personnalisée
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingLetter}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1E5A6E] hover:brightness-125 bg-[#0D2B45]/20 px-2.5 py-1 rounded-lg border border-[#0D2B45]/40 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{isGeneratingLetter ? "Génération IA..." : "Rédiger avec l'IA"}</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Votre lettre de motivation (ou cliquez sur 'Rédiger avec l'IA' pour une proposition sur-mesure)..."
                    className="w-full rounded-xl border border-[#D1E3EC] bg-[#FFFFFF] p-3 text-xs text-[#0D2B45] placeholder-slate-400 focus:outline-none focus:border-[#1E5A6E]/60"
                  />
                </div>

                {/* Consent and Human review check */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="confirmApprove"
                    checked={candidateApproved}
                    onChange={(e) => setCandidateApproved(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D1E3EC] bg-[#FFFFFF] text-[#0D2B45] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="confirmApprove" className="text-xs text-slate-600 cursor-pointer">
                    Je confirme avoir vérifié mes informations et autorise l&apos;envoi de cette candidature.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleInPlatformSubmit}
                  disabled={isSubmitting || !candidateApproved}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] py-3 text-xs font-bold text-[#F4F8FA] shadow-lg shadow-[#0D2B45]/30 hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature assistée"}</span>
                </button>
              </div>
            )}

            {/* METHOD C: Controlled Auto-Apply */}
            {method === "AUTO_APPLY" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-[#1E5A6E]/40 bg-[#FFFFFF] text-xs text-[#1E5A6E] leading-relaxed">
                  <div className="font-semibold flex items-center gap-1.5 mb-1 text-[#1E5A6E]">
                    <ShieldCheck className="h-4 w-4" />
                    Candidature intelligente supervisée (Auto-Apply éthique)
                  </div>
                  JobFinder AI pré-remplit les champs et prépare votre dossier complet. Conformément aux règles de sécurité, aucune candidature n&apos;est transmise sans votre revue explicite.
                </div>

                <div className="rounded-xl border border-[#D1E3EC] bg-[#FFFFFF] p-3 text-xs space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">
                    Vérification du dossier pré-rempli :
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-[#D1E3EC] pb-1">
                    <span>Poste ciblé :</span>
                    <span className="font-semibold text-[#0D2B45]">{job.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-[#D1E3EC] pb-1">
                    <span>Entreprise :</span>
                    <span className="font-semibold text-[#0D2B45]">{job.companyName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Statut des pré-requis :</span>
                    <span className="text-[#1E5A6E] font-semibold">Profil compatible validé</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoApplyConsent"
                    checked={candidateApproved}
                    onChange={(e) => setCandidateApproved(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D1E3EC] bg-[#FFFFFF] text-[#0D2B45] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoApplyConsent" className="text-xs text-slate-600 cursor-pointer">
                    J&apos;ai inspecté le dossier pré-rempli et donne mon accord explicite pour l&apos;envoi vers ce recruteur partenaire.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleInPlatformSubmit}
                  disabled={isSubmitting || !candidateApproved}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] via-[#8E5E47] to-[#1E5A6E] py-3 text-xs font-bold text-[#F4F8FA] shadow-lg shadow-[#0D2B45]/30 hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSubmitting ? "Traitement..." : "Approuver et envoyer la candidature"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
