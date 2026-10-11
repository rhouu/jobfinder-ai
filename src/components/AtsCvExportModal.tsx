"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Printer, Download, Sparkles, CheckCircle2, ShieldCheck, FileText } from "lucide-react";

interface AtsCvExportModalProps {
  user: {
    name: string;
    email: string;
    candidateProfile?: {
      headline?: string;
      bio?: string;
      location?: string;
      skills: string[];
    };
  };
  onClose: () => void;
}

export function AtsCvExportModal({ user, onClose }: AtsCvExportModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted || typeof document === "undefined") return null;

  const candidateName = user.name || "Candidat";
  const headline = user.candidateProfile?.headline || "Ingénieur Études et Développement / Spécialiste Tech";
  const location = user.candidateProfile?.location || "Casablanca, Maroc";
  const bio =
    user.candidateProfile?.bio ||
    "Professionnel motivé doté d'une solide formation technique et d'une passion pour le développement de solutions logicielles performantes. Rigoureux, autonome et orienté résultats avec une forte capacité d'adaptation aux environnements agiles.";
  const skills = user.candidateProfile?.skills?.length
    ? user.candidateProfile.skills
    : ["React", "Next.js", "TypeScript", "Node.js", "Python", "Docker", "SQL / PostgreSQL", "Git / GitHub", "Méthodes Agiles / Scrum"];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      {/* Print-specific style tag injected for pure ATS Moroccan standard printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ats-cv-print-area,
          #ats-cv-print-area * {
            visibility: visible;
          }
          #ats-cv-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl rounded-2xl bg-slate-100 shadow-2xl my-auto text-slate-900 max-h-[92vh] flex flex-col overflow-hidden border border-slate-300"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between p-4 sm:p-5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0D2B45] text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0D2B45] flex items-center gap-1.5">
                <span>Générateur CV Format ATS Standard Maroc</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100% Parsable ATS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Structure linéaire épurée sans graphiques bloquants, optimisée pour Taleo, Workday & Recruteurs Maroc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] text-white px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer / Télécharger en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CV Preview Area */}
        <div className="overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          <div
            id="ats-cv-print-area"
            ref={printAreaRef}
            className="w-full max-w-[210mm] bg-white p-8 sm:p-12 rounded-lg shadow-md border border-slate-300 text-slate-900 space-y-6 font-sans"
            style={{ minHeight: "297mm", fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {/* Header: Identification */}
            <div className="border-b-2 border-slate-800 pb-4 text-center sm:text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {candidateName}
              </h1>
              <p className="text-base font-bold text-[#1E5A6E] mt-1">{headline}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                <span>📍 {location}</span>
                <span>✉️ {user.email}</span>
                <span>📞 +212 6 XX XX XX XX</span>
                <span>🔗 linkedin.com/in/{candidateName.toLowerCase().replace(/\s+/g, "")}</span>
              </div>
            </div>

            {/* Section: Profil Professionnel */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                Profil Professionnel & Synthèse
              </h2>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {bio}
              </p>
            </div>

            {/* Section: Compétences Clés */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                Compétences Techniques & Fonctionnelles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">Technologies principales : </span>
                  <span className="text-slate-700">{skills.slice(0, 6).join(", ")}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Outils & Environnement : </span>
                  <span className="text-slate-700">
                    {skills.slice(6).join(", ") || "Git, VS Code, CI/CD, Postman, Linux"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Méthodologies : </span>
                  <span className="text-slate-700">Agile, Scrum, Revue de Code, Tests Unitaires</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Soft Skills : </span>
                  <span className="text-slate-700">Communication, Esprit d&apos;équipe, Rigueur, Autonomie</span>
                </div>
              </div>
            </div>

            {/* Section: Expériences & Stages PFE */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                Expériences Professionnelles & Stages
              </h2>

              <div className="space-y-3">
                <div className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>Stage de Fin d&apos;Études (PFE) — Ingénierie Logicielle</span>
                    <span className="text-slate-600 font-normal">Fév 2025 – Juin 2025</span>
                  </div>
                  <div className="text-slate-600 italic">Entreprise Technologique Innovante • Casablanca, Maroc</div>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-700 leading-relaxed">
                    <li>
                      Conception et développement d&apos;une architecture modulaire en utilisant {skills[0] || "React"} et {skills[1] || "Node.js"}.
                    </li>
                    <li>
                      Optimisation des temps de réponse des requêtes de base de données de 35% grâce à l&apos;indexation ciblée.
                    </li>
                    <li>
                      Intégration d&apos;APIs RESTful sécurisées et collaboration au sein d&apos;une équipe agile de 5 personnes.
                    </li>
                  </ul>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>Stage Technique d&apos;Application</span>
                    <span className="text-slate-600 font-normal">Juil 2024 – Août 2024</span>
                  </div>
                  <div className="text-slate-600 italic">Société de Services Numériques (ESN) • Rabat, Maroc</div>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-700 leading-relaxed">
                    <li>
                      Participation au développement de fonctionnalités frontend responsive et tests utilisateurs.
                    </li>
                    <li>
                      Automatisation de tâches récurrentes de déploiement via scripts Bash et GitHub Actions.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section: Formation Académique */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                Formation & Diplômes
              </h2>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>Diplôme d&apos;Ingénieur d&apos;État en Informatique & Systèmes d&apos;Information</span>
                    <span className="text-slate-600 font-normal">2020 – 2025</span>
                  </div>
                  <div className="text-slate-600">École Nationale des Sciences Appliquées (ENSA) • Maroc</div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>Baccalauréat Sciences Mathématiques ou Sciences Physiques</span>
                    <span className="text-slate-600 font-normal">2020</span>
                  </div>
                  <div className="text-slate-600">Académie Régionale d&apos;Éducation et de Formation • Mention Très Bien</div>
                </div>
              </div>
            </div>

            {/* Section: Langues & Centres d'intérêt */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
                Langues & Atouts Complémentaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">Français :</span> Bilingue / Professionnel
                </div>
                <div>
                  <span className="font-bold text-slate-900">Arabe :</span> Langue maternelle
                </div>
                <div>
                  <span className="font-bold text-slate-900">Anglais :</span> Courant (Technique & Écrit)
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
