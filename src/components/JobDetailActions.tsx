"use client";

import React, { useState } from "react";
import { ApplicationModal } from "./ApplicationModal";
import { Sparkles, ExternalLink, Send, MessageSquare } from "lucide-react";

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

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-5 py-3 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>Postuler / Lettre IA</span>
        </button>
      </div>

      {isModalOpen && (
        <ApplicationModal
          job={job}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
