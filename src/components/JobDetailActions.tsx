"use client";

import React, { useState } from "react";
import { ApplicationModal } from "./ApplicationModal";
import { Sparkles, ExternalLink, Send } from "lucide-react";

interface JobDetailActionsProps {
  job: {
    id: string;
    title: string;
    companyName: string;
    description: string;
    applicationMethod: "EXTERNAL" | "ASSISTED" | "AUTO_APPLY";
    officialApplyUrl?: string | null;
  };
}

export function JobDetailActions({ job }: JobDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        {job.applicationMethod === "EXTERNAL" && job.officialApplyUrl ? (
          <a
            href={job.officialApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-6 py-3 text-xs font-bold text-[#F4F8FA] shadow-lg shadow-[#0D2B45]/30 hover:brightness-110 transition-all hover:scale-105"
          >
            <span>Postuler sur le site officiel</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D2B45] to-[#1E5A6E] px-6 py-3 text-xs font-bold text-[#F4F8FA] shadow-lg shadow-[#0D2B45]/30 hover:brightness-110 transition-all hover:scale-105 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Postuler directement</span>
          </button>
        )}
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
