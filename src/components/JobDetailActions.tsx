"use client";

import React, { useState } from "react";
import { ApplicationModal } from "./ApplicationModal";
import { InterviewSimulatorModal } from "./InterviewSimulatorModal";
import { Sparkles, Send, MessageSquare, HelpCircle, Share2 } from "lucide-react";

interface JobDetailActionsProps {
  job: {
    id: string;
    title: string;
    companyName: string;
    description: string;
    applicationMethod: "EXTERNAL" | "ASSISTED" | "AUTO_APPLY";
    officialApplyUrl?: string | null;
    companyPhone?: string | null;
  };
}

export function JobDetailActions({ job }: JobDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://jobfinder.ma/jobs/${job.id}`;
    const text = `📢 Opportunité sur JobFinder AI :\n*${job.title}* chez *${job.companyName}*\nConsulte l'offre et postule ici : ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          title="Partager cette offre sur WhatsApp"
          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-emerald-600" />
          <span>Partager sur WhatsApp</span>
        </button>
        {job.companyPhone && (
          <a
            href={`https://wa.me/${job.companyPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Bonjour, je vous contacte au sujet de votre offre "${job.title}" publiée sur JobFinder AI.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-4 py-3 text-xs font-bold transition-all shadow-sm"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp Recruteur</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => setIsInterviewModalOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/40 px-4 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-blue-600" />
          <span>Simuler Entretien IA</span>
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs font-black text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Postuler / Lettre IA</span>
        </button>
      </div>

      {isModalOpen && (
        <ApplicationModal
          job={job}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isInterviewModalOpen && (
        <InterviewSimulatorModal
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.companyName}
          onClose={() => setIsInterviewModalOpen(false)}
        />
      )}
    </>
  );
}
