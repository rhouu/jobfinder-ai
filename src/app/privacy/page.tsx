import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, ArrowLeft, Lock, Trash2, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col justify-between selection:bg-[#0D2B45] selection:text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E5A6E] hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        <div className="rounded-3xl border border-[#D1E3EC] bg-[#FFFFFF]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D2B45]/20 border border-[#0D2B45]/40 text-[#1E5A6E]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Politique de Confidentialité & Sécurité</h1>
              <p className="text-xs text-[#1E5A6E]/80">Dernière mise à jour : 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-800/80 leading-relaxed">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#1E5A6E]" />
              1. Traitement et Protection de votre CV
            </h2>
            <p>
              Lorsque vous importez un document CV sur JobFinder AI, celui-ci est stocké dans un espace sécurisé non indexé publiquement. Le contenu texte est extrait exclusivement pour identifier vos compétences techniques, votre formation et vos expériences afin de calculer le score de correspondance avec les opportunités professionnelles.
            </p>

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#1E5A6E]" />
              2. Utilisation des Fournisseurs d&apos;Intelligence Artificielle
            </h2>
            <p>
              Les analyses de matching IA et la génération de lettres de motivation utilisent des modèles avancés (Gemini / OpenAI) via des requêtes sécurisées côté serveur (Server-to-Server API). Vos données personnelles ne sont jamais utilisées pour entraîner des modèles publics tiers sans votre consentement explicite.
            </p>

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              3. Droit à l&apos;oubli et Suppression Totale
            </h2>
            <p>
              Conformément aux normes RGPD et aux législations applicables au Maroc (CNDP) et à l&apos;international, vous disposez d&apos;un contrôle total sur vos données. Vous pouvez à tout instant supprimer votre CV et réinitialiser l&apos;ensemble des scores calculés depuis votre espace candidat.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
