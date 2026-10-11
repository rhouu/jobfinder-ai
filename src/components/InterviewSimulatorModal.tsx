"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface InterviewModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
}

interface InterviewQuestion {
  question: string;
  category: "Technique" | "Comportemental / RH" | "Mise en situation";
  recommendedAnswer: string;
  trapToAvoid: string;
}

export function InterviewSimulatorModal({ jobId, jobTitle, companyName, onClose }: InterviewModalProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  React.useEffect(() => {
    fetchQuestions();
  }, [jobId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview-prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl my-auto text-[#0D2B45] max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F0F6] px-3 py-1 text-xs font-black text-[#0D2B45] mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Simulateur d&apos;Entretien IA</span>
            </div>
            <h2 className="text-xl font-black text-[#0D2B45]">{jobTitle}</h2>
            <p className="text-xs text-slate-500">{companyName} • Questions fréquentes des recruteurs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#0D2B45] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              L&apos;IA prépare vos questions et réponses d&apos;entretien types...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question selection pills */}
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeQuestionIdx === idx
                      ? "bg-[#0D2B45] text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Question {idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Box */}
            {questions[activeQuestionIdx] && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#1E5A6E] tracking-wider">
                      {questions[activeQuestionIdx].category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {activeQuestionIdx + 1} sur {questions.length}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0D2B45] leading-snug">
                    « {questions[activeQuestionIdx].question} »
                  </h3>
                </div>

                {/* Recommended answer */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Réponse Recommandée (Méthode STAR) :</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {questions[activeQuestionIdx].recommendedAnswer}
                  </p>
                </div>

                {/* Trap to avoid */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-black">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Piège classique à éviter en entretien :</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {questions[activeQuestionIdx].trapToAvoid}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={activeQuestionIdx === 0}
                onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                Précédente
              </button>
              <button
                type="button"
                disabled={activeQuestionIdx === questions.length - 1}
                onClick={() => setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#0D2B45] text-xs font-bold text-white hover:bg-[#1E5A6E] disabled:opacity-30 transition-all cursor-pointer"
              >
                Question suivante
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
